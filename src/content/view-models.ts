import { computePriceRange, formatPriceRange } from '../catalog/price-range'
import { scoreBand } from '../catalog/score'
import { relId } from '../lib/relations'

// Conversões dos documentos do Payload para o que as páginas mostram

export type ImageSet = { src: string; srcSet: string; alt: string; width: number; height: number }
export type OfferLink = { id: number; storeName: string; href: string }
export type VariantOffers = {
  variantId: number
  label: string
  priceText: string | null
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

function storeOf(offer: OfferDoc): { name: string; active: boolean } | null {
  if (!offer.store || typeof offer.store !== 'object') return null
  const store = offer.store as { name?: string; active?: boolean | null }
  return { name: store.name ?? 'Loja', active: store.active !== false }
}

// Faixa de preço e botões de uma variante (spec §5.2): só ofertas ativas de lojas ativas
export function variantOffers(variant: { id: number; label: string }, offers: OfferDoc[], now: Date): VariantOffers {
  const usable = offers.filter(
    (offer) => String(relId(offer.variant)) === String(variant.id) && offer.status === 'active' && storeOf(offer)?.active,
  )
  const range = computePriceRange(usable, now)
  return {
    variantId: variant.id,
    label: variant.label,
    priceText: formatPriceRange(range),
    stale: range.kind === 'stale',
    unavailable: range.kind === 'unavailable',
    offers: usable.map((offer) => ({ id: offer.id, storeName: storeOf(offer)!.name, href: `/ir/${offer.id}` })),
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
