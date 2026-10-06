// Regras de indexação do site inteiro (spec §5.5 e §11). Até o lançamento a chave
// "Liberar o site para o Google" fica desligada no painel: nada é indexado.

export function robotsMetadata(indexingEnabled: boolean): { index: boolean; follow: boolean } {
  return indexingEnabled ? { index: true, follow: true } : { index: false, follow: false }
}

export type RobotsRules = {
  rules: { userAgent: string; allow?: string; disallow: string | string[] }
  sitemap?: string
}

// robots.txt: bloqueia /ir/, painel, API e busca (spec §11) e aponta o sitemap
export function robotsRules({ indexingEnabled, siteUrl }: { indexingEnabled: boolean; siteUrl: string }): RobotsRules {
  if (!indexingEnabled) return { rules: { userAgent: '*', disallow: '/' } }
  return {
    rules: { userAgent: '*', allow: '/', disallow: ['/ir/', '/admin', '/api/', '/busca/'] },
    sitemap: `${siteUrl}/sitemap.xml`,
  }
}

// Formatos aceitos para valores que entram em scripts e meta tags
export const GA4_ID_PATTERN = /^G-[A-Z0-9]{4,20}$/
export const ADSENSE_CLIENT_PATTERN = /^ca-pub-\d{10,20}$/
export const SEARCH_CONSOLE_TOKEN_PATTERN = /^[A-Za-z0-9_-]{10,100}$/
