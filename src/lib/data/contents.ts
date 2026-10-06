import { cache } from 'react'
import type { Where } from 'payload'

import type { ContentType } from '@/content/paths'
import { relId } from '@/lib/relations'
import { SLUG_PATTERN } from '@/lib/slug'
import type { Content } from '@/payload-types'

import { getSitePayload } from './payload'

const PUBLIC = { overrideAccess: false } as const

// Conteúdo público (publicado, ou agendado com a data já alcançada) do tipo pedido.
// cache(): generateMetadata e a página leem o mesmo conteúdo numa só consulta.
export const getPublicContent = cache(async (type: ContentType, slug: string): Promise<Content | null> => {
  if (!SLUG_PATTERN.test(slug)) return null
  const payload = await getSitePayload()
  const { docs } = await payload.find({
    collection: 'contents',
    where: { and: [{ slug: { equals: slug } }, { type: { equals: type } }] },
    depth: 2,
    limit: 1,
    ...PUBLIC,
  })
  return docs[0] ?? null
})

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

// Outros conteúdos públicos da mesma subcategoria ou que citam os mesmos produtos (bloco "Relacionados")
export async function getRelatedContents(content: Content, limit = 6): Promise<Content[]> {
  const subcategoryId = relId(content.primarySubcategory)
  const productIds = (content.referencedProducts ?? []).map(relId).filter((id) => id !== null)
  const matches: Where[] = [
    ...(subcategoryId !== null ? [{ primarySubcategory: { equals: subcategoryId } }] : []),
    ...(productIds.length ? [{ referencedProducts: { in: productIds } }] : []),
  ]
  if (matches.length === 0) return []
  const payload = await getSitePayload()
  const { docs } = await payload.find({
    collection: 'contents',
    where: { and: [{ id: { not_equals: content.id } }, { or: matches }] },
    sort: '-publishAt',
    depth: 0,
    limit,
    ...PUBLIC,
  })
  return docs
}
