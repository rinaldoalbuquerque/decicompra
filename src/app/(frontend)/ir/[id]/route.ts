import config from '@payload-config'
import { getPayload } from 'payload'

import { resolveOutbound, type OutboundOffer } from '@/catalog/outbound'

export const dynamic = 'force-dynamic'

const MAX_INT = 2_147_483_647

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const location = resolveOutbound(await loadOffer(id))
  return new Response(null, {
    status: 302,
    headers: { Location: location, 'X-Robots-Tag': 'noindex, nofollow', 'Cache-Control': 'no-store' },
  })
}

async function loadOffer(id: string): Promise<OutboundOffer | null> {
  // Só ids que cabem num inteiro do Postgres; qualquer falha leva para a home em vez de erro 500
  if (!/^[1-9]\d{0,9}$/.test(id) || Number(id) > MAX_INT) return null
  let offer
  try {
    const payload = await getPayload({ config })
    offer = await payload.findByID({ collection: 'offers', id: Number(id), depth: 1, disableErrors: true })
  } catch (error) {
    console.error('[/ir] falha ao carregar a oferta', id, error)
    return null
  }
  if (!offer) return null
  const store = typeof offer.store === 'object' && offer.store ? offer.store : null
  const product = typeof offer.product === 'object' && offer.product ? offer.product : null
  return {
    status: offer.status,
    affiliateUrl: offer.affiliateUrl,
    store: store ? { active: Boolean(store.active) } : null,
    product: product?.slug ? { slug: product.slug, status: product.status } : null,
  }
}
