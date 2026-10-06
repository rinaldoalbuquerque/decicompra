import type { Metadata } from 'next'

// Metadados de uma página (spec §11): título, descrição, canônico autorreferente (sem parâmetros de
// rastreamento), Open Graph e Twitter Card. O Next troca o openGraph do layout pelo da página (não
// mescla), por isso o nome do site e o idioma são repetidos aqui. A imagem vem do opengraph-image da rota.
export function pageMetadata({
  path,
  title,
  description,
  noindex = false,
  type = 'website',
}: {
  path: string
  title: string
  description?: string | null
  noindex?: boolean
  type?: 'website' | 'article'
}): Metadata {
  const desc = description?.trim() || undefined
  return {
    title,
    description: desc,
    alternates: { canonical: path },
    openGraph: { title, description: desc, url: path, siteName: 'DeciCompra', locale: 'pt_BR', type },
    twitter: { card: 'summary_large_image', title, description: desc },
    // Só retira do Google; nunca libera (a liberação é a chave do lançamento, no layout)
    ...(noindex ? { robots: { index: false, follow: true } } : {}),
  }
}
