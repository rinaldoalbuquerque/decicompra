import { APIError, ValidationError } from 'payload'
import type {
  CollectionAfterChangeHook,
  CollectionAfterDeleteHook,
  CollectionBeforeChangeHook,
  CollectionBeforeDeleteHook,
} from 'payload'

import { specValueErrors, syncSpecRows, type SpecRow } from '../../catalog/spec-template'
import { pick, relId } from '../../lib/relations'
import { loadSubcategoryRules } from '../catalog-rules'

export const prepareVariant: CollectionBeforeChangeHook = async ({ data, originalDoc, operation, req }) => {
  const productId = relId(pick(data, originalDoc, 'product'))
  if (productId === null) {
    throw new ValidationError({ collection: 'variants', errors: [{ path: 'product', message: 'Escolha o produto.' }] })
  }
  const product = await req.payload.findByID({ collection: 'products', id: productId, depth: 0, req })
  const { template } = await loadSubcategoryRules(req, relId(product.subcategory))
  const specs = syncSpecRows(template, pick<SpecRow[]>(data, originalDoc, 'specs'), 'variant')
  const label = String(pick(data, originalDoc, 'label') ?? '').trim()
  data.specs = specs
  data.label = label
  data.title = `${product.name} — ${label}`

  const errors = specValueErrors(template, specs).map((message) => ({ path: 'specs', message }))
  // Na criação o Payload também passa originalDoc (sem id)
  const existingId = operation === 'update' ? relId(originalDoc?.id) : null
  const duplicates = await req.payload.count({
    collection: 'variants',
    where: {
      and: [
        { product: { equals: productId } },
        { label: { equals: label } },
        ...(existingId !== null ? [{ id: { not_equals: existingId } }] : []),
      ],
    },
    req,
  })
  if (duplicates.totalDocs > 0) errors.push({ path: 'label', message: 'Já existe uma variante com este rótulo neste produto.' })
  if (errors.length > 0) throw new ValidationError({ collection: 'variants', errors })
  return data
}

// Exatamente uma variante de referência por produto
export const syncReference: CollectionAfterChangeHook = async ({ doc, req, context }) => {
  if (context.skipReferenceSync) return doc
  const siblings = (
    await req.payload.find({
      collection: 'variants',
      where: { and: [{ product: { equals: relId(doc.product) } }, { id: { not_equals: doc.id } }] },
      depth: 0,
      limit: 1000,
      req,
    })
  ).docs
  if (doc.isReference) {
    for (const sibling of siblings.filter((s) => s.isReference)) {
      await req.payload.update({ collection: 'variants', id: sibling.id, data: { isReference: false }, req, context: { skipReferenceSync: true } })
    }
    return doc
  }
  if (!siblings.some((s) => s.isReference)) {
    await req.payload.update({ collection: 'variants', id: doc.id, data: { isReference: true }, req, context: { skipReferenceSync: true } })
    return { ...doc, isReference: true }
  }
  return doc
}

export const guardVariantDelete: CollectionBeforeDeleteHook = async ({ id, req, context }) => {
  if (context.cascade) return
  const variant = await req.payload.findByID({ collection: 'variants', id, depth: 0, req })
  const productId = relId(variant.product)
  if (productId === null) return
  const product = await req.payload.findByID({ collection: 'products', id: productId, depth: 0, req })
  const { totalDocs } = await req.payload.count({ collection: 'variants', where: { product: { equals: productId } }, req })
  if (totalDocs <= 1 && product.status !== 'rascunho') {
    throw new APIError(
      'Não é possível apagar a única variante de um produto publicado. Volte o produto para rascunho antes.',
      409,
      undefined,
      true,
    )
  }
}

export const promoteReference: CollectionAfterDeleteHook = async ({ doc, req, context }) => {
  if (context.cascade || !doc.isReference) return
  const { docs } = await req.payload.find({
    collection: 'variants',
    where: { product: { equals: relId(doc.product) } },
    sort: 'createdAt',
    depth: 0,
    limit: 1,
    req,
  })
  if (docs[0]) {
    await req.payload.update({ collection: 'variants', id: docs[0].id, data: { isReference: true }, req, context: { skipReferenceSync: true } })
  }
}
