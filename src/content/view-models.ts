import { computePriceRange, formatPriceRange, priceRangeParts } from '../catalog/price-range'
import { scoreBand } from '../catalog/score'
import { relId } from '../lib/relations'

// Conversões dos documentos do Payload para o que as páginas mostram

export type ImageSet = { src: string; srcSet: string; alt: string; width: number; height: number }
export type OfferLink = { id: number; storeId: number | null; storeName: string; href: string }
export type VariantOffers = {
  variantId: number
  label: string
  // Texto completo ("R$ … · verificado em …"), "Indisponível no momento" ou null se desatualizada
  priceText: string | null
  // Partes separadas para quem mostra só os valores (tabelas, barra do celular)
  valuesText: string | null
  verifiedText: string | null
  stale: boolean
  unavailable: boolean
  offers: OfferLink[]
}
export type ProductSummary = {
  id: number
  slug: string
  name: string
  brandName: string | null
  finalScore: number | null
  scoreText: string | null
  band: string | null
  image: ImageSet | null
  reference: VariantOffers | null
}

export type OfferDoc = {
  id: number
  variant: unknown
  store: unknown
  status: 'active' | 'unavailable'
  priceMin: number
  priceMax: number
  verifiedAt: string
}

type MediaLike = {
  url?: string | null
  alt?: string | null
  width?: number | null
  height?: number | null
  sizes?: Record<string, { url?: string | null; width?: number | null } | undefined> | null
}

export function formatScore(score: number | null | undefined): string | null {
  if (score === null || score === undefined) return null
  return score.toFixed(1).replace('.', ',')
}

export function toImageSet(media: unknown): ImageSet | null {
  if (!media || typeof media !== 'object') return null
  const doc = media as MediaLike
  if (!doc.url) return null
  const sizes = ['thumb', 'card', 'large']
    .map((name) => doc.sizes?.[name])
    .filter((size): size is { url: string; width: number } => Boolean(size?.url && size.width))
  return {
    src: sizes.find((size) => size.width === 640)?.url ?? sizes[0]?.url ?? doc.url,
    srcSet: sizes.map((size) => `${size.url} ${size.width}w`).join(', '),
    alt: doc.alt ?? '',
    width: doc.width ?? 0,
    height: doc.height ?? 0,
  }
}

function storeOf(offer: OfferDoc): { id: number | null; name: string; active: boolean } | null {
  if (!offer.store || typeof offer.store !== 'object') return null
  const store = offer.store as { id?: number; name?: string; active?: boolean | null }
  return { id: store.id ?? null, name: store.name ?? 'Loja', active: store.active !== false }
}

// Faixa de preço e botões de uma variante (spec §5.2): só ofertas ativas de lojas ativas
export function variantOffers(variant: { id: number; label: string }, offers: OfferDoc[], now: Date): VariantOffers {
  const usable = offers.filter(
    (offer) => String(relId(offer.variant)) === String(variant.id) && offer.status === 'active' && storeOf(offer)?.active,
  )
  const range = computePriceRange(usable, now)
  const parts = priceRangeParts(range)
  return {
    variantId: variant.id,
    label: variant.label,
    priceText: formatPriceRange(range),
    valuesText: parts?.values ?? null,
    verifiedText: parts?.verified ?? null,
    stale: range.kind === 'stale',
    unavailable: range.kind === 'unavailable',
    offers: usable.map((offer) => {
      const store = storeOf(offer)!
      return { id: offer.id, storeId: store.id, storeName: store.name, href: `/ir/${offer.id}/` }
    }),
  }
}

type ProductLike = {
  id: number
  slug?: string | null
  name: string
  finalScore?: number | null
  brand?: unknown
  images?: unknown[] | null
}

export function toProductSummary(
  product: ProductLike,
  variants: { id: number; label: string; isReference?: boolean | null }[],
  offers: OfferDoc[],
  now: Date,
): ProductSummary {
  const reference = variants.find((variant) => variant.isReference) ?? variants[0] ?? null
  const brand = product.brand && typeof product.brand === 'object' ? (product.brand as { name?: string }) : null
  const score = product.finalScore ?? null
  return {
    id: product.id,
    slug: product.slug ?? String(product.id),
    name: product.name,
    brandName: brand?.name ?? null,
    finalScore: score,
    scoreText: formatScore(score),
    band: score === null ? null : scoreBand(score),
    image: toImageSet(product.images?.[0]),
    reference: reference ? variantOffers(reference, offers, now) : null,
  }
}

const yearInSaoPaulo = new Intl.DateTimeFormat('en-US', { timeZone: 'America/Sao_Paulo', year: 'numeric' })

// Ano exibido no título do Melhores: o da revisão (o "atualizado em"), no fuso de São Paulo
export function listYear(dates: { reviewedAt?: string | null; publishAt?: string | null; createdAt?: string | null }): number {
  const source = dates.reviewedAt ?? dates.publishAt ?? dates.createdAt ?? new Date().toISOString()
  return Number(yearInSaoPaulo.format(new Date(source)))
}

// Variante usada no preço e nos botões de uma escolha do Melhores: a escolhida, se for do produto
export function pickVariant(
  entry: { reference: VariantOffers | null; variants: VariantOffers[] },
  variantId: number | null | undefined,
): VariantOffers | null {
  return (variantId != null ? entry.variants.find((variant) => variant.variantId === variantId) : undefined) ?? entry.reference
}
