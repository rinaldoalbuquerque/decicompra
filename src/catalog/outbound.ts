export type OutboundOffer = {
  status: 'active' | 'unavailable'
  affiliateUrl: string
  store: { active: boolean } | null
  product: { slug: string } | null
}

// Destino de /ir/{id} (spec §5.3)
export function resolveOutbound(offer: OutboundOffer | null): string {
  if (!offer) return '/'
  if (offer.status === 'active' && offer.store?.active && offer.affiliateUrl) return offer.affiliateUrl
  return offer.product ? `/produtos/${offer.product.slug}/` : '/'
}
