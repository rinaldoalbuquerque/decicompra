import type { Metadata } from 'next'

// Metadados de uma página (spec §11): título, descrição, canônico autorreferente (sem parâmetros de
// rastreamento), Open Graph e Twitter Card. O Next troca o openGraph do layout pelo da página (não
// mescla), por isso o nome do site, o idioma e a imagem padrão são repetidos aqui. Rotas com
// opengraph-image próprio (produto, conteúdos) trocam a imagem padrão pela delas.
export const DEFAULT_OG_IMAGE = { url: '/og/padrao.png', width: 1200, height: 630, alt: 'DeciCompra · Compare. Entenda. Decida.' }

export function pageMetadata({
  path,
  title,
  description,
  noindex = false,
  type = 'website',
  ownImage = false,
}: {
  path: string
  title: string
  description?: string | null
  noindex?: boolean
  type?: 'website' | 'article'
  // A rota tem opengraph-image próprio: a imagem configurada aqui teria prioridade sobre ele
  ownImage?: boolean
}): Metadata {
  const desc = description?.trim() || undefined
  const images = ownImage ? {} : { images: [DEFAULT_OG_IMAGE] }
  return {
    title,
    description: desc,
    alternates: { canonical: path },
    openGraph: { title, description: desc, url: path, siteName: 'DeciCompra', locale: 'pt_BR', type, ...images },
    twitter: { card: 'summary_large_image', title, description: desc, ...(ownImage ? {} : { images: [DEFAULT_OG_IMAGE.url] }) },
    // Só retira do Google; nunca libera (a liberação é a chave do lançamento, no layout)
    ...(noindex ? { robots: { index: false, follow: true } } : {}),
  }
}
