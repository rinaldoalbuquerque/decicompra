import { ogImage } from '@/lib/og-image'

export const dynamic = 'force-static'

// Imagem de compartilhamento padrão (páginas sem imagem própria), em endereço fixo para os metadados
export function GET() {
  return ogImage({ kicker: 'Análises independentes', title: 'Compare. Entenda. Decida.' })
}
