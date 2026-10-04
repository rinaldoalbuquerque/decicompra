import config from '@payload-config'
import { getPayload } from 'payload'

import { resolveOutbound, type OutboundOffer } from '@/catalog/outbound'

export const dynamic = 'force-dynamic'

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const location = resolveOutbound(await loadOffer(id))
  return new Response(null, {
    status: 302,
    headers: { Location: location, 'X-Robots-Tag': 'noindex, nofollow', 'Cache-Control': 'no-store' },
  })
}

async function loadOffer(id: string): Promise<OutboundOffer | null> {
  if (!/^\d+$/.test(id)) return null
  const payload = await getPayload({ config })
  const offer = await payload.findByID({ collection: 'offers', id: Number(id), depth: 1, disableErrors: true })
  if (!offer) return null
  const store = typeof offer.store === 'object' && offer.store ? offer.store : null
  const product = typeof offer.product === 'object' && offer.product ? offer.product : null
  return {
    status: offer.status,
    affiliateUrl: offer.affiliateUrl,
    store: store ? { active: Boolean(store.active) } : null,
    product: product?.slug ? { slug: product.slug } : null,
  }
}
