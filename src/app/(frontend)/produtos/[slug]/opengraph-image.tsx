import { getPublicProduct } from '@/lib/data/products'
import { OG_CONTENT_TYPE, OG_SIZE, ogImage } from '@/lib/og-image'

export const alt = 'Análise no DeciCompra'
export const size = OG_SIZE
export const contentType = OG_CONTENT_TYPE

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const page = await getPublicProduct((await params).slug)
  if (!page) return ogImage({ title: 'DeciCompra' })
  const analyzed = page.product.status === 'analise'
  return ogImage({ kicker: analyzed ? 'Análise' : 'Ficha técnica', title: page.product.name, score: analyzed ? page.summary.scoreText : null })
}
