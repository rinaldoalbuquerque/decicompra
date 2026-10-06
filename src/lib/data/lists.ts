import type { Where } from 'payload'

import { pageCount, PER_PAGE } from '@/content/pagination'
import { contentPath, type ContentType } from '@/content/paths'
import type { ProductSummary } from '@/content/view-models'
import { relId } from '@/lib/relations'

import { cachedList } from './cache'
import { getSitePayload } from './payload'
import { getProductSummaries } from './products'

const PUBLIC = { overrideAccess: false } as const

type Id = number | string

const ids = (values: unknown[]): number[] => [...new Set(values.map(relId).filter((id): id is Id => id !== null).map(Number))]

export type PublicSubcategory = { id: number; slug: string; name: string; description: string | null; icon: string | null; publicItems: number }
export type PublicCategory = Omit<PublicSubcategory, 'publicItems'> & { subcategories: PublicSubcategory[] }

export type Paged<T> = { docs: T[]; total: number; page: number; pages: number }

export type ContentCardData = {
  id: number
  type: ContentType
  slug: string
  title: string
  summary: string | null
  publishAt: string | null
  reviewedAt: string | null
  href: string
  subcategoryName: string | null
}

const byOrderThenName = (a: { order?: number | null; name: string }, b: { order?: number | null; name: string }) =>
  (a.order ?? 0) - (b.order ?? 0) || a.name.localeCompare(b.name, 'pt-BR')

// Categorias e subcategorias com ao menos 1 item público (spec §3.1 e §5.5). Item público:
// conteúdo público que cita a subcategoria (principal ou relacionada) ou produto em análise.
export const getPublicTaxonomy = cachedList('taxonomia-publica', async (): Promise<PublicCategory[]> => {
  const payload = await getSitePayload()
  const [categories, contents, products] = await Promise.all([
    payload.find({ collection: 'categories', where: { active: { not_equals: false } }, depth: 0, pagination: false, ...PUBLIC }),
    payload.find({
      collection: 'contents',
      depth: 0,
      pagination: false,
      select: { primarySubcategory: true, relatedSubcategories: true },
      ...PUBLIC,
    }),
    payload.find({
      collection: 'products',
      where: { status: { equals: 'analise' } },
      depth: 0,
      pagination: false,
      select: { subcategory: true },
      ...PUBLIC,
    }),
  ])

  const items = new Map<number, number>()
  const add = (id: number) => items.set(id, (items.get(id) ?? 0) + 1)
  for (const content of contents.docs) for (const id of ids([content.primarySubcategory, ...(content.relatedSubcategories ?? [])])) add(id)
  for (const product of products.docs) for (const id of ids([product.subcategory])) add(id)

  const toBase = (doc: (typeof categories.docs)[number]) => ({
    id: doc.id,
    slug: doc.slug ?? '',
    name: doc.name,
    description: doc.description ?? null,
    icon: doc.icon ?? null,
  })
  const parents = categories.docs.filter((doc) => !doc.parent && doc.slug).sort(byOrderThenName)
  return parents
    .map((parent) => ({
      ...toBase(parent),
      subcategories: categories.docs
        .filter((doc) => relId(doc.parent) !== null && Number(relId(doc.parent)) === parent.id && doc.slug && items.has(doc.id))
        .sort(byOrderThenName)
        .map((doc) => ({ ...toBase(doc), publicItems: items.get(doc.id)! })),
    }))
    .filter((category) => category.subcategories.length > 0)
})

type CardDoc = {
  id: number
  type: ContentType
  slug?: string | null
  title: string
  summary?: string | null
  publishAt?: string | null
  reviewedAt?: string | null
  primarySubcategory?: number | { name?: string | null } | null
}

// Campos mínimos de um cartão (o nome da subcategoria vem populado)
const CARD_QUERY = {
  depth: 1,
  select: { title: true, type: true, slug: true, summary: true, publishAt: true, reviewedAt: true, primarySubcategory: true },
  populate: { categories: { name: true } },
} as const

const toContentCard = (doc: CardDoc): ContentCardData => ({
  id: doc.id,
  type: doc.type,
  slug: doc.slug!,
  title: doc.title,
  summary: doc.summary ?? null,
  publishAt: doc.publishAt ?? null,
  reviewedAt: doc.reviewedAt ?? null,
  href: contentPath(doc.type, doc.slug!),
  subcategoryName: typeof doc.primarySubcategory === 'object' ? (doc.primarySubcategory?.name ?? null) : null,
})

// Cartões de conteúdos escolhidos (ex.: destaques da home), na ordem pedida; não públicos ficam de fora
export const getContentCardsByIds = cachedList('cartoes', async (contentIds: number[]): Promise<ContentCardData[]> => {
  if (contentIds.length === 0) return []
  const payload = await getSitePayload()
  const { docs } = await payload.find({ collection: 'contents', where: { id: { in: contentIds } }, pagination: false, ...CARD_QUERY, ...PUBLIC })
  const byId = new Map(docs.filter((doc) => doc.slug).map((doc) => [doc.id, toContentCard(doc)]))
  return contentIds.map((id) => byId.get(id)).filter((card): card is ContentCardData => Boolean(card))
})

export type ContentFilter = {
  type?: ContentType | ContentType[]
  subcategoryIds?: number[]
  authorId?: number
  productIds?: number[]
  page: number
  perPage?: number
}

// Conteúdos públicos, mais recentes primeiro
export const listContents = cachedList('conteudos', async (filter: ContentFilter): Promise<Paged<ContentCardData>> => {
  const perPage = filter.perPage ?? PER_PAGE
  const and: Where[] = []
  if (filter.type) and.push({ type: Array.isArray(filter.type) ? { in: filter.type } : { equals: filter.type } })
  if (filter.subcategoryIds) {
    if (filter.subcategoryIds.length === 0) return { docs: [], total: 0, page: filter.page, pages: 1 }
    and.push({ or: [{ primarySubcategory: { in: filter.subcategoryIds } }, { relatedSubcategories: { in: filter.subcategoryIds } }] })
  }
  if (filter.authorId !== undefined) and.push({ author: { equals: filter.authorId } })
  if (filter.productIds) {
    if (filter.productIds.length === 0) return { docs: [], total: 0, page: filter.page, pages: 1 }
    and.push({ referencedProducts: { in: filter.productIds } })
  }
  const payload = await getSitePayload()
  const result = await payload.find({
    collection: 'contents',
    where: and.length ? { and } : {},
    sort: '-publishAt',
    page: filter.page,
    limit: perPage,
    ...CARD_QUERY,
    ...PUBLIC,
  })
  return {
    docs: result.docs.filter((doc) => doc.slug).map(toContentCard),
    total: result.totalDocs,
    page: filter.page,
    pages: pageCount(result.totalDocs, perPage),
  }
})

// Produtos em análise (ficha e rascunho ficam de fora das grades), mais recentes primeiro
export const listAnalyzedProducts = cachedList(
  'produtos-analisados',
  async (filter: { subcategoryId?: number; brandId?: number; page: number; perPage?: number }): Promise<Paged<ProductSummary>> => {
    const perPage = filter.perPage ?? PER_PAGE
    const and: Where[] = [{ status: { equals: 'analise' } }]
    if (filter.subcategoryId !== undefined) and.push({ subcategory: { equals: filter.subcategoryId } })
    if (filter.brandId !== undefined) and.push({ brand: { equals: filter.brandId } })
    const payload = await getSitePayload()
    const result = await payload.find({
      collection: 'products',
      where: { and },
      sort: '-publishedAt',
      page: filter.page,
      limit: perPage,
      depth: 0,
      select: { slug: true },
      ...PUBLIC,
    })
    const summaries = await getProductSummaries(result.docs.map((doc) => doc.id))
    return {
      docs: result.docs
        .map((doc) => summaries.get(doc.id))
        .filter((entry): entry is NonNullable<typeof entry> => Boolean(entry))
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        .map(({ product, specRows, variants, ...summary }) => summary),
      total: result.totalDocs,
      page: filter.page,
      pages: pageCount(result.totalDocs, perPage),
    }
  },
)

export type BrandListItem = { id: number; slug: string; name: string; publicItems: number }

// Marcas com ao menos 1 item público (produto em análise ou conteúdo que cita produto dela), A–Z
export const listBrands = cachedList('marcas', async (filter: { page: number; perPage?: number }): Promise<Paged<BrandListItem>> => {
  const perPage = filter.perPage ?? PER_PAGE
  const payload = await getSitePayload()
  const [brands, products, contents] = await Promise.all([
    payload.find({ collection: 'brands', depth: 0, pagination: false, select: { name: true, slug: true }, ...PUBLIC }),
    payload.find({ collection: 'products', depth: 0, pagination: false, select: { brand: true, status: true }, ...PUBLIC }),
    payload.find({ collection: 'contents', depth: 0, pagination: false, select: { referencedProducts: true }, ...PUBLIC }),
  ])
  const brandOfProduct = new Map(products.docs.map((product) => [product.id, Number(relId(product.brand))]))
  const items = new Map<number, number>()
  const add = (brandId: number) => items.set(brandId, (items.get(brandId) ?? 0) + 1)
  for (const product of products.docs) if (product.status === 'analise') add(brandOfProduct.get(product.id)!)
  for (const content of contents.docs) {
    const cited = new Set(ids(content.referencedProducts ?? []).map((id) => brandOfProduct.get(id)).filter((id): id is number => id !== undefined))
    for (const brandId of cited) add(brandId)
  }
  const all = brands.docs
    .filter((brand) => brand.slug && items.has(brand.id))
    .sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'))
    .map((brand) => ({ id: brand.id, slug: brand.slug!, name: brand.name, publicItems: items.get(brand.id)! }))
  const start = (filter.page - 1) * perPage
  return { docs: all.slice(start, start + perPage), total: all.length, page: filter.page, pages: pageCount(all.length, perPage) }
})

// Itens públicos que contam para indexar a marca (spec §5.5)
export const countBrandPublicItems = cachedList('itens-da-marca', async (brandId: number): Promise<number> => {
  const payload = await getSitePayload()
  const products = await payload.find({
    collection: 'products',
    where: { brand: { equals: brandId } },
    depth: 0,
    pagination: false,
    select: { status: true },
    ...PUBLIC,
  })
  const analyzed = products.docs.filter((product) => product.status === 'analise').length
  if (products.docs.length === 0) return analyzed
  const contents = await payload.count({ collection: 'contents', where: { referencedProducts: { in: products.docs.map((p) => p.id) } }, ...PUBLIC })
  return analyzed + contents.totalDocs
})
