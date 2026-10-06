import type { CollectionAfterChangeHook, CollectionAfterDeleteHook, PayloadRequest, Where } from 'payload'

import { authorPath, brandPath, categoryPath, contentPath, productPath } from '../content/paths'
import { pathsForBrand, pathsForCategory, pathsForContent, pathsForProduct } from '../content/revalidation'
import { relId } from '../lib/relations'
import { revalidateLists, revalidatePaths, revalidateTaxonomy } from '../lib/revalidate'

// Liga as mudanças salvas no painel à atualização das páginas geradas (spec §5.6)

// Páginas geradas + cache das listas paginadas (que dependem de quase tudo)
async function revalidatePages(paths: string[]): Promise<void> {
  await revalidatePaths(paths)
  await revalidateLists()
}

type Id = number | string

const ids = (values: unknown[]): Id[] => [...new Set(values.map(relId).filter((id): id is Id => id !== null))]

async function subcategoryPathOf(req: PayloadRequest, id: Id | null): Promise<string | null> {
  if (id === null) return null
  const sub = await req.payload.findByID({ collection: 'categories', id, depth: 1, req, disableErrors: true })
  if (!sub?.slug) return null
  const parent = typeof sub.parent === 'object' ? sub.parent : null
  return categoryPath(sub.slug, parent?.slug ?? null)
}

// Páginas afetadas por vários produtos de uma vez: a do produto, o hub da subcategoria, a marca,
// os conteúdos que o citam e a home. Poucas consultas, qualquer que seja a quantidade de produtos.
async function productsPaths(req: PayloadRequest, productIds: Id[], previousSlug?: string | null): Promise<string[]> {
  if (productIds.length === 0) return ['/']
  const { docs: products } = await req.payload.find({ collection: 'products', where: { id: { in: productIds } }, depth: 0, pagination: false, req })
  const subcategoryIds = ids(products.map((product) => product.subcategory))
  const brandIds = ids(products.map((product) => product.brand))
  const [subcategories, brands, contents] = await Promise.all([
    subcategoryIds.length
      ? req.payload.find({ collection: 'categories', where: { id: { in: subcategoryIds } }, depth: 1, pagination: false, req })
      : null,
    brandIds.length ? req.payload.find({ collection: 'brands', where: { id: { in: brandIds } }, depth: 0, pagination: false, req }) : null,
    req.payload.find({ collection: 'contents', where: { referencedProducts: { in: productIds } }, depth: 0, pagination: false, req }),
  ])
  const subcategoryPath = new Map(
    (subcategories?.docs ?? [])
      .filter((sub) => sub.slug)
      .map((sub) => [String(sub.id), categoryPath(sub.slug!, typeof sub.parent === 'object' ? (sub.parent?.slug ?? null) : null)]),
  )
  const brandSlug = new Map((brands?.docs ?? []).filter((brand) => brand.slug).map((brand) => [String(brand.id), brand.slug!]))
  const contentPaths = contents.docs.filter((content) => content.slug).map((content) => contentPath(content.type, content.slug!))
  const paths = new Set<string>()
  for (const product of products) {
    if (!product.slug) continue
    const brand = brandSlug.get(String(relId(product.brand)))
    const productPaths = pathsForProduct({
      slug: product.slug,
      previousSlug: productIds.length === 1 ? previousSlug : null,
      subcategoryPath: subcategoryPath.get(String(relId(product.subcategory))) ?? null,
      brandPath: brand ? brandPath(brand) : null,
      contentPaths,
    })
    for (const path of productPaths) paths.add(path)
  }
  paths.add('/')
  return [...paths]
}

// Só as páginas dos produtos (sem hubs nem conteúdos): para os blocos que listam outros produtos
async function productPagesOf(req: PayloadRequest, where: Where): Promise<string[]> {
  const { docs } = await req.payload.find({ collection: 'products', where, depth: 0, limit: 200, req })
  return docs.filter((product) => product.slug).map((product) => productPath(product.slug!))
}

// Mudanças que alteram quais subcategorias têm item público (menu, home, /categorias/)
const sameIds = (a: unknown[] | null | undefined, b: unknown[] | null | undefined) =>
  JSON.stringify(ids(a ?? []).sort()) === JSON.stringify(ids(b ?? []).sort())

export const revalidateProduct: CollectionAfterChangeHook = async ({ doc, previousDoc, req }) => {
  if (doc.status !== previousDoc?.status || relId(doc.subcategory) !== relId(previousDoc?.subcategory)) await revalidateTaxonomy()
  const paths = await productsPaths(req, [doc.id], previousDoc?.slug)
  // Status ou subcategoria mudou: o produto entra ou sai do bloco "Alternativas" dos vizinhos
  const subcategoryIds = ids([doc.subcategory, previousDoc?.subcategory])
  if (subcategoryIds.length && (doc.status !== previousDoc?.status || relId(doc.subcategory) !== relId(previousDoc?.subcategory))) {
    paths.push(...(await productPagesOf(req, { and: [{ subcategory: { in: subcategoryIds } }, { id: { not_equals: doc.id } }] })))
  }
  await revalidatePages([...new Set(paths)])
  return doc
}

export const revalidateDeletedProduct: CollectionAfterDeleteHook = async ({ doc }) => {
  await revalidateTaxonomy()
  if (doc.slug) await revalidatePages([productPath(doc.slug), '/'])
}

// Variantes e ofertas mudam o que a página do produto (e quem o cita) mostra; se mudaram de
// produto, o anterior também
export const revalidateProductOfDoc: CollectionAfterChangeHook = async ({ doc, previousDoc, req }) => {
  await revalidatePages(await productsPaths(req, ids([doc.product, previousDoc?.product])))
  return doc
}

export const revalidateProductOfDeletedDoc: CollectionAfterDeleteHook = async ({ doc, req }) => {
  await revalidatePages(await productsPaths(req, ids([doc.product])))
}

// Páginas dos produtos citados (antes e depois): o bloco "Alternativas e comparativos" lista o conteúdo
type CitingDoc = { referencedProducts?: unknown[] | null } | null | undefined

async function citedProductPages(req: PayloadRequest, ...docs: CitingDoc[]): Promise<string[]> {
  const cited = ids(docs.flatMap((doc) => doc?.referencedProducts ?? []))
  return cited.length ? productPagesOf(req, { id: { in: cited } }) : []
}

export const revalidateContent: CollectionAfterChangeHook = async ({ doc, previousDoc, req }) => {
  const visibilityChanged =
    doc.status !== previousDoc?.status ||
    doc.publishAt !== previousDoc?.publishAt ||
    relId(doc.primarySubcategory) !== relId(previousDoc?.primarySubcategory) ||
    !sameIds(doc.relatedSubcategories, previousDoc?.relatedSubcategories)
  if (visibilityChanged) await revalidateTaxonomy()
  if (!doc.slug) return doc
  await revalidatePages([
    ...pathsForContent({
      type: doc.type,
      slug: doc.slug,
      previous: previousDoc?.slug ? { type: previousDoc.type, slug: previousDoc.slug } : null,
      subcategoryPath: await subcategoryPathOf(req, relId(doc.primarySubcategory)),
    }),
    ...(await citedProductPages(req, doc, previousDoc)),
  ])
  return doc
}

export const revalidateDeletedContent: CollectionAfterDeleteHook = async ({ doc, req }) => {
  await revalidateTaxonomy()
  if (!doc.slug) return
  await revalidatePages([
    ...pathsForContent({ type: doc.type, slug: doc.slug, subcategoryPath: await subcategoryPathOf(req, relId(doc.primarySubcategory)) }),
    ...(await citedProductPages(req, doc)),
  ])
}

export const revalidateCategory: CollectionAfterChangeHook = async ({ doc, previousDoc, req }) => {
  await revalidateTaxonomy()
  if (!doc.slug) return doc
  const parentOf = async (id: Id | null) =>
    id === null ? null : await req.payload.findByID({ collection: 'categories', id, depth: 0, req, disableErrors: true })
  const parent = await parentOf(relId(doc.parent))
  const previousParentId = relId(previousDoc?.parent)
  const previousParent = previousParentId === relId(doc.parent) ? parent : await parentOf(previousParentId)
  await revalidatePages(
    pathsForCategory({
      path: categoryPath(doc.slug, parent?.slug ?? null),
      previousPath: previousDoc?.slug ? categoryPath(previousDoc.slug, previousParent?.slug ?? null) : null,
      parentPath: parent?.slug ? categoryPath(parent.slug) : null,
    }),
  )
  return doc
}

export const revalidateBrand: CollectionAfterChangeHook = async ({ doc, previousDoc }) => {
  if (doc.slug) await revalidatePages(pathsForBrand({ slug: doc.slug, previousSlug: previousDoc?.slug }))
  return doc
}

// Nome, logo ou ativação da loja mudam os botões de todos os produtos com ofertas dela.
// Outras edições (programa de afiliados, observações) não aparecem nas páginas.
export const revalidateStore: CollectionAfterChangeHook = async ({ doc, previousDoc, operation, req }) => {
  if (operation !== 'update') return doc
  const visibleChange = doc.name !== previousDoc?.name || doc.active !== previousDoc?.active || relId(doc.logo) !== relId(previousDoc?.logo)
  if (!visibleChange) return doc
  const offers = await req.payload.find({ collection: 'offers', where: { store: { equals: doc.id } }, depth: 0, pagination: false, req })
  await revalidatePages(await productsPaths(req, ids(offers.docs.map((offer) => offer.product))))
  return doc
}

export const revalidateAuthor: CollectionAfterChangeHook = async ({ doc, previousDoc }) => {
  if (!doc.slug) return doc
  await revalidatePages([authorPath(doc.slug), ...(previousDoc?.slug && previousDoc.slug !== doc.slug ? [authorPath(previousDoc.slug)] : [])])
  return doc
}
