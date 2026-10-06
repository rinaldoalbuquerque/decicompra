// Sitemap (spec §11): índice com um sitemap por tipo, só com endereços indexáveis

export const SITEMAP_KINDS = ['produtos', 'conteudos', 'taxonomia', 'marcas', 'institucionais'] as const
export type SitemapKind = (typeof SITEMAP_KINDS)[number]

export type SitemapEntry = { loc: string; lastmod?: string | null }

// Páginas institucionais (spec §3.2 e §6.12), na ordem do rodapé
export const INSTITUTIONAL_PAGES = [
  { path: '/sobre/', title: 'Sobre o DeciCompra' },
  { path: '/contato/', title: 'Contato' },
  { path: '/como-avaliamos/', title: 'Como avaliamos os produtos' },
  { path: '/politica-editorial/', title: 'Política editorial' },
  { path: '/divulgacao-de-afiliados/', title: 'Divulgação de afiliados' },
  { path: '/publicidade-e-transparencia/', title: 'Publicidade e transparência' },
  { path: '/privacidade/', title: 'Política de privacidade' },
  { path: '/cookies/', title: 'Política de cookies' },
  { path: '/termos/', title: 'Termos de uso' },
] as const

const escapeXml = (value: string) =>
  value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;')

const HEADER = '<?xml version="1.0" encoding="UTF-8"?>'
const NS = 'http://www.sitemaps.org/schemas/sitemap/0.9'

function isoDate(value: string | null | undefined): string | null {
  if (!value) return null
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? null : date.toISOString()
}

export function urlsetXml(entries: SitemapEntry[]): string {
  const urls = entries.map((entry) => {
    const lastmod = isoDate(entry.lastmod)
    return `<url><loc>${escapeXml(entry.loc)}</loc>${lastmod ? `<lastmod>${lastmod}</lastmod>` : ''}</url>`
  })
  return `${HEADER}\n<urlset xmlns="${NS}">\n${urls.join('\n')}\n</urlset>\n`
}

export function sitemapIndexXml(siteUrl: string): string {
  const items = SITEMAP_KINDS.map((kind) => `<sitemap><loc>${escapeXml(`${siteUrl}/sitemaps/${kind}.xml`)}</loc></sitemap>`)
  return `${HEADER}\n<sitemapindex xmlns="${NS}">\n${items.join('\n')}\n</sitemapindex>\n`
}
