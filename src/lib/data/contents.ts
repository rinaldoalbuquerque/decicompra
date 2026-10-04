import type { ContentType } from '@/content/paths'
import type { Content } from '@/payload-types'

import { getSitePayload } from './payload'

const PUBLIC = { overrideAccess: false } as const

// Conteúdo público (publicado, ou agendado com a data já alcançada) do tipo pedido
export async function getPublicContent(type: ContentType, slug: string): Promise<Content | null> {
  const payload = await getSitePayload()
  const { docs } = await payload.find({
    collection: 'contents',
    where: { and: [{ slug: { equals: slug } }, { type: { equals: type } }] },
    depth: 2,
    limit: 1,
    ...PUBLIC,
  })
  return docs[0] ?? null
}

// Comparativos e listas de Melhores públicos que citam o produto
export async function getRelatedForProduct(productId: number, limit = 12): Promise<Content[]> {
  const payload = await getSitePayload()
  const { docs } = await payload.find({
    collection: 'contents',
    where: { and: [{ referencedProducts: { in: [productId] } }, { type: { in: ['comparativo', 'melhores'] } }] },
    sort: '-publishAt',
    depth: 0,
    limit,
    ...PUBLIC,
  })
  return docs
}
