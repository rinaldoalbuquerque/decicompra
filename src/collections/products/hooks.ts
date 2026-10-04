import { ValidationError } from 'payload'
import type { CollectionAfterChangeHook, CollectionBeforeChangeHook, CollectionBeforeDeleteHook } from 'payload'

import { roleOf } from '../../access'
import { checkProductPublication, type ProductStatus } from '../../catalog/product-status'
import { computeFinalScore, syncScoreRows, type ScoreRow } from '../../catalog/score'
import { missingRequiredSpecs, specValueErrors, syncSpecRows, type SpecRow } from '../../catalog/spec-template'
import { withContext } from '../../lib/hook-context'
import { pick, relId } from '../../lib/relations'
import { loadSubcategoryRules } from '../catalog-rules'

const count = (value: unknown) => (Array.isArray(value) ? value.length : 0)

export const prepareProduct: CollectionBeforeChangeHook = async ({ data, originalDoc, operation, req, context }) => {
  const { template, criteria } = await loadSubcategoryRules(req, relId(pick(data, originalDoc, 'subcategory')))
  const specs = syncSpecRows(template, pick<SpecRow[]>(data, originalDoc, 'specs'), 'product')
  const scores = syncScoreRows(criteria, pick<ScoreRow[]>(data, originalDoc, 'scores'))
  data.specs = specs
  data.scores = scores
  data.finalScore = computeFinalScore(criteria, scores)

  const status = pick<ProductStatus>(data, originalDoc, 'status') ?? 'rascunho'
  if (status === 'analise' && !pick(data, originalDoc, 'publishedAt')) data.publishedAt = new Date().toISOString()
  if (context.skipPublicationCheck) return data

  const errors = specValueErrors(template, specs).map((message) => ({ path: 'specs', message }))
  if (roleOf(req.user) === 'redator' && status !== 'rascunho') {
    errors.push({ path: 'status', message: 'Redatores só podem salvar como rascunho.' })
  }

  if (status !== 'rascunho') {
    // Na criação o Payload também passa originalDoc (sem id); só a edição tem variantes
    const existingId = operation === 'update' ? relId(originalDoc?.id) : null
    const variants =
      existingId === null
        ? []
        : (await req.payload.find({ collection: 'variants', where: { product: { equals: existingId } }, depth: 0, limit: 1000, req })).docs
    const missingSpecs = [
      ...missingRequiredSpecs(template, specs, 'product'),
      ...variants.flatMap((variant) =>
        missingRequiredSpecs(template, (variant.specs ?? []) as SpecRow[], 'variant').map((label) => `${label} (${variant.label})`),
      ),
    ]
    const seo = pick<{ metaDescription?: string | null }>(data, originalDoc, 'seo')
    errors.push(
      ...checkProductPublication({
        status,
        finalScore: data.finalScore as number | null,
        imageCount: count(pick(data, originalDoc, 'images')),
        variantCount: variants.length,
        missingSpecs,
        verdict: pick<string>(data, originalDoc, 'verdict'),
        prosCount: count(pick(data, originalDoc, 'pros')),
        consCount: count(pick(data, originalDoc, 'cons')),
        metaDescription: seo?.metaDescription,
        sourcesCount: count(pick(data, originalDoc, 'sources')),
        reviewedAt: pick<string>(data, originalDoc, 'reviewedAt'),
      }).map((message) => ({ path: 'status', message })),
    )
  }

  if (errors.length > 0) throw new ValidationError({ collection: 'products', errors })
  return data
}

// Cria a variante "Padrão"; mantém as variantes em dia quando o nome ou a subcategoria mudam
export const afterProductChange: CollectionAfterChangeHook = async ({ doc, previousDoc, operation, req }) => {
  if (operation === 'create') {
    await req.payload.create({ collection: 'variants', data: { product: doc.id, label: 'Padrão', isReference: true }, req })
    return doc
  }
  const renamed = previousDoc?.name !== doc.name
  const moved = relId(previousDoc?.subcategory) !== relId(doc.subcategory)
  if (renamed || moved) {
    const { docs } = await req.payload.find({ collection: 'variants', where: { product: { equals: doc.id } }, depth: 0, limit: 1000, req })
    for (const variant of docs) await req.payload.update({ collection: 'variants', id: variant.id, data: {}, req })
  }
  return doc
}

export const cascadeProductDelete: CollectionBeforeDeleteHook = async ({ id, req }) => {
  await withContext(req, { cascade: true }, () => req.payload.delete({ collection: 'offers', where: { product: { equals: id } }, req }))
  await withContext(req, { cascade: true }, () => req.payload.delete({ collection: 'variants', where: { product: { equals: id } }, req }))
}
