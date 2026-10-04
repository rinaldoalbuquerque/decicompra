import { ValidationError } from 'payload'
import type { CollectionAfterChangeHook, CollectionAfterDeleteHook, CollectionBeforeChangeHook, PayloadRequest } from 'payload'

import { offerPriceErrors } from '../../catalog/price-range'
import { withContext } from '../../lib/hook-context'
import { pick, relId } from '../../lib/relations'

export const prepareOffer: CollectionBeforeChangeHook = async ({ data, originalDoc, req }) => {
  const errors: { path: string; message: string }[] = []
  const productId = relId(pick(data, originalDoc, 'product'))
  const variantId = relId(pick(data, originalDoc, 'variant'))
  const storeId = relId(pick(data, originalDoc, 'store'))
  if (productId === null) errors.push({ path: 'product', message: 'Escolha o produto.' })
  if (variantId === null) errors.push({ path: 'variant', message: 'Escolha a variante.' })
  if (storeId === null) errors.push({ path: 'store', message: 'Escolha a loja.' })
  if (productId === null || variantId === null || storeId === null) {
    throw new ValidationError({ collection: 'offers', errors })
  }

  const [variant, store] = await Promise.all([
    req.payload.findByID({ collection: 'variants', id: variantId, depth: 0, req }),
    req.payload.findByID({ collection: 'stores', id: storeId, depth: 0, req }),
  ])
  if (String(relId(variant.product)) !== String(productId)) {
    errors.push({ path: 'variant', message: 'A variante escolhida não pertence a este produto.' })
  }
  const priceMin = Number(pick(data, originalDoc, 'priceMin'))
  const priceMax = Number(pick(data, originalDoc, 'priceMax'))
  errors.push(...offerPriceErrors(priceMin, priceMax).map((message) => ({ path: 'priceMax', message })))
  if (errors.length > 0) throw new ValidationError({ collection: 'offers', errors })

  data.title = `${variant.title} · ${store.name}`
  return data
}

export async function refreshHasActiveOffer(req: PayloadRequest, productId: number | string | null): Promise<void> {
  if (productId === null) return
  const exists = await req.payload.count({ collection: 'products', where: { id: { equals: productId } }, req })
  if (exists.totalDocs === 0) return
  const active = await req.payload.count({
    collection: 'offers',
    where: { and: [{ product: { equals: productId } }, { status: { equals: 'active' } }] },
    req,
  })
  await withContext(req, { skipPublicationCheck: true }, () =>
    req.payload.update({ collection: 'products', id: productId, data: { hasActiveOffer: active.totalDocs > 0 }, req }),
  )
}

export const afterOfferChange: CollectionAfterChangeHook = async ({ doc, previousDoc, req, context }) => {
  if (context.cascade) return doc
  const ids = new Set([relId(doc.product), relId(previousDoc?.product)].filter((id) => id !== null).map(String))
  for (const id of ids) await refreshHasActiveOffer(req, id)
  return doc
}

export const afterOfferDelete: CollectionAfterDeleteHook = async ({ doc, req, context }) => {
  if (context.cascade) return
  await refreshHasActiveOffer(req, relId(doc.product))
}
