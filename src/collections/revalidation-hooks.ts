import type { CollectionAfterChangeHook, CollectionAfterDeleteHook, PayloadRequest } from 'payload'

import { brandPath, categoryPath, contentPath, productPath } from '../content/paths'
import { pathsForBrand, pathsForCategory, pathsForContent, pathsForProduct } from '../content/revalidation'
import { relId } from '../lib/relations'
import { revalidatePaths } from '../lib/revalidate'

// Liga as mudanças salvas no painel à atualização das páginas geradas (spec §5.6)

async function subcategoryPathOf(req: PayloadRequest, id: number | string | null): Promise<string | null> {
  if (id === null) return null
  const sub = await req.payload.findByID({ collection: 'categories', id, depth: 1, req, disableErrors: true })
  if (!sub?.slug) return null
  const parent = typeof sub.parent === 'object' ? sub.parent : null
  return categoryPath(sub.slug, parent?.slug ?? null)
}

async function productPaths(req: PayloadRequest, productId: number | string | null, previousSlug?: string | null): Promise<string[]> {
  if (productId === null) return ['/']
  const product = await req.payload.findByID({ collection: 'products', id: productId, depth: 0, req, disableErrors: true })
  if (!product?.slug) return ['/']
  const [subcategoryPath, brand, contents] = await Promise.all([
    subcategoryPathOf(req, relId(product.subcategory)),
    relId(product.brand) === null
      ? null
      : req.payload.findByID({ collection: 'brands', id: relId(product.brand)!, depth: 0, req, disableErrors: true }),
    req.payload.find({ collection: 'contents', where: { referencedProducts: { in: [productId] } }, depth: 0, limit: 1000, req }),
  ])
  return pathsForProduct({
    slug: product.slug,
    previousSlug,
    subcategoryPath,
    brandPath: brand?.slug ? brandPath(brand.slug) : null,
    contentPaths: contents.docs.filter((content) => content.slug).map((content) => contentPath(content.type, content.slug!)),
  })
}

export const revalidateProduct: CollectionAfterChangeHook = async ({ doc, previousDoc, req }) => {
  await revalidatePaths(await productPaths(req, doc.id, previousDoc?.slug))
  return doc
}

export const revalidateDeletedProduct: CollectionAfterDeleteHook = async ({ doc }) => {
  if (doc.slug) await revalidatePaths([productPath(doc.slug), '/'])
}

// Variantes e ofertas mudam o que a página do produto (e quem o cita) mostra
export const revalidateProductOfDoc: CollectionAfterChangeHook = async ({ doc, req }) => {
  await revalidatePaths(await productPaths(req, relId(doc.product)))
  return doc
}

export const revalidateProductOfDeletedDoc: CollectionAfterDeleteHook = async ({ doc, req }) => {
  await revalidatePaths(await productPaths(req, relId(doc.product)))
}

export const revalidateContent: CollectionAfterChangeHook = async ({ doc, previousDoc, req }) => {
  if (!doc.slug) return doc
  await revalidatePaths(
    pathsForContent({
      type: doc.type,
      slug: doc.slug,
      previous: previousDoc?.slug ? { type: previousDoc.type, slug: previousDoc.slug } : null,
      subcategoryPath: await subcategoryPathOf(req, relId(doc.primarySubcategory)),
    }),
  )
  return doc
}

export const revalidateDeletedContent: CollectionAfterDeleteHook = async ({ doc, req }) => {
  if (!doc.slug) return
  await revalidatePaths(
    pathsForContent({ type: doc.type, slug: doc.slug, subcategoryPath: await subcategoryPathOf(req, relId(doc.primarySubcategory)) }),
  )
}

export const revalidateCategory: CollectionAfterChangeHook = async ({ doc, previousDoc, req }) => {
  if (!doc.slug) return doc
  const parentId = relId(doc.parent)
  const parent = parentId === null ? null : await req.payload.findByID({ collection: 'categories', id: parentId, depth: 0, req, disableErrors: true })
  await revalidatePaths(
    pathsForCategory({
      path: categoryPath(doc.slug, parent?.slug ?? null),
      previousPath: previousDoc?.slug ? categoryPath(previousDoc.slug, parent?.slug ?? null) : null,
      parentPath: parent?.slug ? categoryPath(parent.slug) : null,
    }),
  )
  return doc
}

export const revalidateBrand: CollectionAfterChangeHook = async ({ doc, previousDoc }) => {
  if (doc.slug) await revalidatePaths(pathsForBrand({ slug: doc.slug, previousSlug: previousDoc?.slug }))
  return doc
}

// Loja ativada/desativada muda os botões de todos os produtos com ofertas dela
export const revalidateStore: CollectionAfterChangeHook = async ({ doc, req }) => {
  const offers = await req.payload.find({ collection: 'offers', where: { store: { equals: doc.id } }, depth: 0, limit: 5000, req })
  const productIds = [...new Set(offers.docs.map((offer) => relId(offer.product)).filter((id) => id !== null))]
  const paths = new Set<string>()
  for (const id of productIds) for (const path of await productPaths(req, id)) paths.add(path)
  await revalidatePaths([...paths])
  return doc
}
