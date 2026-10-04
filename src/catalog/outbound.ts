export type OutboundOffer = {
  status: 'active' | 'unavailable'
  affiliateUrl: string
  store: { active: boolean } | null
  product: { slug: string; status?: string | null } | null
}

// Destino de /ir/{id} (spec §5.3)
export function resolveOutbound(offer: OutboundOffer | null): string {
  if (!offer) return '/'
  if (offer.status === 'active' && offer.store?.active && offer.affiliateUrl) return offer.affiliateUrl
  // Produto em rascunho não tem página pública
  return offer.product && offer.product.status !== 'rascunho' ? `/produtos/${offer.product.slug}/` : '/'
}
