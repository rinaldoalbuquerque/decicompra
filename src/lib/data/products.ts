import type { Criterion } from '@/catalog/score'
import type { SpecAttribute, SpecRow } from '@/catalog/spec-template'
import { toProductSummary, variantOffers, type OfferDoc, type ProductSummary, type VariantOffers } from '@/content/view-models'
import type { Category, Product, Variant } from '@/payload-types'

import { getSitePayload } from './payload'

export type ProductPage = {
  product: Product
  summary: ProductSummary
  variants: (VariantOffers & { specs: Variant['specs']; modelCode?: string | null; isReference: boolean })[]
  subcategory: Category | null
  category: Category | null
  template: SpecAttribute[]
  criteria: Criterion[]
}

const PUBLIC = { overrideAccess: false } as const

// Resumo + documento + especificações (produto e variante de referência) para tabelas
export type SummaryEntry = ProductSummary & { product: Product; specRows: SpecRow[] }

// Página de produto: só produtos fora de rascunho (o acesso público já filtra)
export async function getPublicProduct(slug: string, now = new Date()): Promise<ProductPage | null> {
  const payload = await getSitePayload()
  const { docs } = await payload.find({ collection: 'products', where: { slug: { equals: slug } }, depth: 2, limit: 1, ...PUBLIC })
  const product = docs[0]
  if (!product || product.status === 'rascunho') return null

  const [variants, offers] = await Promise.all([
    payload.find({ collection: 'variants', where: { product: { equals: product.id } }, sort: 'createdAt', depth: 0, limit: 100, ...PUBLIC }),
    payload.find({ collection: 'offers', where: { product: { equals: product.id } }, depth: 1, limit: 500, ...PUBLIC }),
  ])
  const offerDocs = offers.docs as unknown as OfferDoc[]
  const subcategory = typeof product.subcategory === 'object' ? product.subcategory : null
  const category = subcategory && typeof subcategory.parent === 'object' ? subcategory.parent : null

  return {
    product,
    summary: toProductSummary(product, variants.docs, offerDocs, now),
    variants: variants.docs.map((variant) => ({
      ...variantOffers(variant, offerDocs, now),
      specs: variant.specs,
      modelCode: variant.modelCode,
      isReference: Boolean(variant.isReference),
    })),
    subcategory,
    category: category ?? null,
    template: (subcategory?.specTemplate ?? []) as unknown as SpecAttribute[],
    criteria: (subcategory?.criteria ?? []) as unknown as Criterion[],
  }
}

// Produtos públicos da mesma subcategoria com nota mais próxima (bloco "Alternativas")
export async function getSimilarProducts(subcategoryId: number, excludeId: number, score: number | null, limit = 3) {
  const payload = await getSitePayload()
  const { docs } = await payload.find({
    collection: 'products',
    where: { and: [{ subcategory: { equals: subcategoryId } }, { id: { not_equals: excludeId } }] },
    depth: 0,
    limit: 50,
    ...PUBLIC,
  })
  const ranked = docs
    .filter((product) => product.status !== 'rascunho')
    .sort((a, b) => Math.abs((a.finalScore ?? 0) - (score ?? 0)) - Math.abs((b.finalScore ?? 0) - (score ?? 0)))
    .slice(0, limit)
  const summaries = await getProductSummaries(ranked.map((product) => product.id))
  return ranked.map((product) => summaries.get(product.id)).filter((item): item is NonNullable<typeof item> => Boolean(item))
}

// Resumos (card, botão, tabela) de vários produtos numa consulta; rascunhos ficam de fora
export async function getProductSummaries(ids: number[], now = new Date()): Promise<Map<number, SummaryEntry>> {
  const result = new Map<number, SummaryEntry>()
  const unique = [...new Set(ids)]
  if (unique.length === 0) return result
  const payload = await getSitePayload()
  const [products, variants, offers] = await Promise.all([
    payload.find({ collection: 'products', where: { id: { in: unique } }, depth: 1, limit: unique.length, ...PUBLIC }),
    payload.find({ collection: 'variants', where: { product: { in: unique } }, sort: 'createdAt', depth: 0, limit: 1000, ...PUBLIC }),
    payload.find({ collection: 'offers', where: { product: { in: unique } }, depth: 1, limit: 2000, ...PUBLIC }),
  ])
  for (const product of products.docs) {
    if (product.status === 'rascunho') continue
    const ownVariants = variants.docs.filter((variant) => String(typeof variant.product === 'object' ? variant.product.id : variant.product) === String(product.id))
    const reference = ownVariants.find((variant) => variant.isReference) ?? ownVariants[0]
    const specRows = [...((product.specs ?? []) as SpecRow[]), ...((reference?.specs ?? []) as SpecRow[])]
    result.set(product.id, { ...toProductSummary(product, ownVariants, offers.docs as unknown as OfferDoc[], now), product, specRows })
  }
  return result
}
