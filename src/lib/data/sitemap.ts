import { authorPath, categoryPath, CONTENT_PREFIX, contentPath, productPath, brandPath } from '@/content/paths'
import { INSTITUTIONAL_PAGES, type SitemapEntry, type SitemapKind } from '@/content/sitemap'
import { isBrandIndexable } from '@/content/visibility'

import { getPublicTaxonomy, listBrands } from './lists'
import { getSitePayload } from './payload'

const PUBLIC = { overrideAccess: false } as const

// Endereços indexáveis de cada tipo (spec §5.5 e §11); lastmod = revisão ou última atualização
export async function sitemapEntries(kind: SitemapKind, base: string): Promise<SitemapEntry[]> {
  const payload = await getSitePayload()
  const at = (path: string, lastmod?: string | null): SitemapEntry => ({ loc: `${base}${path}`, lastmod })

  if (kind === 'produtos') {
    const { docs } = await payload.find({
      collection: 'products',
      where: { status: { equals: 'analise' } },
      depth: 0,
      pagination: false,
      select: { slug: true, reviewedAt: true, updatedAt: true },
      ...PUBLIC,
    })
    return docs.filter((doc) => doc.slug).map((doc) => at(productPath(doc.slug!), doc.reviewedAt ?? doc.updatedAt))
  }

  if (kind === 'conteudos') {
    const { docs } = await payload.find({
      collection: 'contents',
      depth: 0,
      pagination: false,
      select: { slug: true, type: true, reviewedAt: true, updatedAt: true },
      ...PUBLIC,
    })
    return docs.filter((doc) => doc.slug).map((doc) => at(contentPath(doc.type, doc.slug!), doc.reviewedAt ?? doc.updatedAt))
  }

  if (kind === 'taxonomia') {
    const taxonomy = await getPublicTaxonomy()
    return [
      at('/'),
      at('/categorias/'),
      ...Object.values(CONTENT_PREFIX).map((path) => at(path)),
      at('/marcas/'),
      ...taxonomy.flatMap((category) => [
        at(categoryPath(category.slug)),
        ...category.subcategories.map((sub) => at(categoryPath(sub.slug, category.slug))),
      ]),
    ]
  }

  if (kind === 'marcas') {
    const brands = await listBrands({ page: 1, perPage: 100_000 })
    return brands.docs.filter((brand) => isBrandIndexable(brand.publicItems)).map((brand) => at(brandPath(brand.slug)))
  }

  const authors = await payload.find({ collection: 'authors', depth: 0, pagination: false, select: { slug: true, updatedAt: true }, ...PUBLIC })
  return [
    ...INSTITUTIONAL_PAGES.map((page) => at(page.path)),
    ...authors.docs.filter((doc) => doc.slug).map((doc) => at(authorPath(doc.slug!), doc.updatedAt)),
  ]
}
