import { sql, type PostgresAdapter } from '@payloadcms/db-postgres'

import { categoryPath, contentPath, productPath, brandPath, type ContentType } from '@/content/paths'
import { toTsQuery } from '@/content/search-query'

import { getPublicTaxonomy, listBrands } from './lists'
import { getSitePayload } from './payload'

const PUBLIC = { overrideAccess: false } as const

export type SearchItem = { id: number; title: string; href: string }

export type SearchGroups = {
  products: SearchItem[]
  comparisons: SearchItem[]
  best: SearchItem[]
  articles: SearchItem[]
  brands: SearchItem[]
  subcategories: SearchItem[]
}

const emptyGroups = (): SearchGroups => ({ products: [], comparisons: [], best: [], articles: [], brands: [], subcategories: [] })

type Row = { id: number | string }

// Mantém a ordem de relevância do SQL
const inOrder = <T extends { id: number }>(ranked: number[], docs: T[]) => {
  const byId = new Map(docs.map((doc) => [doc.id, doc]))
  return ranked.map((id) => byId.get(id)).filter((doc): doc is T => Boolean(doc))
}

// Full-text em português + unaccent + prefixo (spec §12.3). O SQL só encontra ids candidatos; a carga
// final passa pelo acesso público (overrideAccess: false), então rascunhos nunca aparecem.
export async function searchAll(term: string, { perGroup = 12 }: { perGroup?: number } = {}): Promise<SearchGroups> {
  const query = toTsQuery(term)
  if (!query) return emptyGroups()
  const payload = await getSitePayload()
  const db = (payload.db as unknown as PostgresAdapter).drizzle
  const limit = perGroup * 2
  const ids = (rows: Row[]) => rows.map((row) => Number(row.id))
  const run = async (statement: ReturnType<typeof sql>) => ids(((await db.execute(statement)) as unknown as { rows: Row[] }).rows)

  const [productIds, contentIds, brandIds, subcategoryIds] = await Promise.all([
    run(sql`
      SELECT p.id FROM products p
      LEFT JOIN brands b ON b.id = p.brand_id
      LEFT JOIN LATERAL (SELECT string_agg(coalesce(v.model_code, ''), ' ') AS codes FROM variants v WHERE v.product_id = p.id) v ON true,
      LATERAL to_tsvector('portuguese', unaccent(coalesce(p.name, '') || ' ' || coalesce(b.name, '') || ' ' || coalesce(v.codes, ''))) doc,
      LATERAL to_tsquery('portuguese', ${query}) q
      WHERE p.status <> 'rascunho' AND doc @@ q
      ORDER BY ts_rank(doc, q) DESC, p.id DESC LIMIT ${limit}`),
    run(sql`
      SELECT c.id FROM contents c,
      LATERAL to_tsvector('portuguese', unaccent(coalesce(c.title, '') || ' ' || coalesce(c.summary, ''))) doc,
      LATERAL to_tsquery('portuguese', ${query}) q
      WHERE c.status IN ('publicado', 'agendado') AND doc @@ q
      ORDER BY ts_rank(doc, q) DESC, c.id DESC LIMIT ${limit * 3}`),
    run(sql`
      SELECT b.id FROM brands b,
      LATERAL to_tsvector('portuguese', unaccent(coalesce(b.name, ''))) doc,
      LATERAL to_tsquery('portuguese', ${query}) q
      WHERE doc @@ q ORDER BY ts_rank(doc, q) DESC, b.id DESC LIMIT ${limit}`),
    run(sql`
      SELECT s.id FROM categories s,
      LATERAL to_tsvector('portuguese', unaccent(coalesce(s.name, ''))) doc,
      LATERAL to_tsquery('portuguese', ${query}) q
      WHERE s.parent_id IS NOT NULL AND doc @@ q ORDER BY ts_rank(doc, q) DESC, s.id DESC LIMIT ${limit}`),
  ])

  const [products, contents, brands, taxonomy] = await Promise.all([
    productIds.length
      ? payload.find({ collection: 'products', where: { id: { in: productIds } }, depth: 0, pagination: false, select: { name: true, slug: true, status: true }, ...PUBLIC })
      : null,
    contentIds.length
      ? payload.find({ collection: 'contents', where: { id: { in: contentIds } }, depth: 0, pagination: false, select: { title: true, slug: true, type: true }, ...PUBLIC })
      : null,
    // Só marcas com item público (mesma regra de /marcas/): sem isso a busca levaria a uma página vazia
    brandIds.length ? listBrands({ page: 1, perPage: 100_000 }) : null,
    subcategoryIds.length ? getPublicTaxonomy() : null,
  ])

  const groups = emptyGroups()
  groups.products = inOrder(productIds, products?.docs ?? [])
    .filter((doc) => doc.slug && doc.status !== 'rascunho')
    .slice(0, perGroup)
    .map((doc) => ({ id: doc.id, title: doc.name, href: productPath(doc.slug!) }))

  const byType = (types: ContentType[]) =>
    inOrder(contentIds, contents?.docs ?? [])
      .filter((doc) => doc.slug && types.includes(doc.type))
      .slice(0, perGroup)
      .map((doc) => ({ id: doc.id, title: doc.title, href: contentPath(doc.type, doc.slug!) }))
  groups.comparisons = byType(['comparativo'])
  groups.best = byType(['melhores'])
  groups.articles = byType(['guia', 'entenda'])

  groups.brands = inOrder(brandIds, brands?.docs ?? [])
    .slice(0, perGroup)
    .map((doc) => ({ id: doc.id, title: doc.name, href: brandPath(doc.slug) }))

  // Só subcategorias com item público (spec §3.1)
  const publicSubs = new Map(
    (taxonomy ?? []).flatMap((category) => category.subcategories.map((sub) => [sub.id, { ...sub, href: categoryPath(sub.slug, category.slug) }] as const)),
  )
  groups.subcategories = subcategoryIds
    .map((id) => publicSubs.get(id))
    .filter((sub): sub is NonNullable<typeof sub> => Boolean(sub))
    .slice(0, perGroup)
    .map((sub) => ({ id: sub.id, title: sub.name, href: sub.href }))

  return groups
}
