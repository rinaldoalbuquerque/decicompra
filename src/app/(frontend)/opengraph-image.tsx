import { OG_CONTENT_TYPE, OG_SIZE, ogImage } from '@/lib/og-image'

export const alt = 'DeciCompra · Compare. Entenda. Decida.'
export const size = OG_SIZE
export const contentType = OG_CONTENT_TYPE

export default function Image() {
  return ogImage({ kicker: 'Análises independentes', title: 'Compare. Entenda. Decida.' })
}
