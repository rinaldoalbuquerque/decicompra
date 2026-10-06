import { getPublicContent } from '@/lib/data/contents'
import { OG_CONTENT_TYPE, OG_SIZE, ogImage } from '@/lib/og-image'

export const alt = 'Entenda no DeciCompra'
export const size = OG_SIZE
export const contentType = OG_CONTENT_TYPE

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const content = await getPublicContent('entenda', (await params).slug)
  return ogImage({ kicker: 'Entenda', title: content?.title ?? 'DeciCompra' })
}
