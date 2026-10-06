import { getPublicContent } from '@/lib/data/contents'
import { OG_CONTENT_TYPE, OG_SIZE, ogImage } from '@/lib/og-image'

export const alt = 'Guia de compra no DeciCompra'
export const size = OG_SIZE
export const contentType = OG_CONTENT_TYPE

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const content = await getPublicContent('guia', (await params).slug)
  return ogImage({ kicker: 'Guia de compra', title: content?.title ?? 'DeciCompra' })
}
