import { SITEMAP_KINDS, urlsetXml, type SitemapKind } from '@/content/sitemap'
import { sitemapEntries } from '@/lib/data/sitemap'
import { siteUrl } from '@/lib/site-url'

export const revalidate = 3600

export function generateStaticParams() {
  return SITEMAP_KINDS.map((kind) => ({ tipo: `${kind}.xml` }))
}

export const dynamicParams = false

// Um sitemap por tipo (produtos, conteúdos, taxonomia, marcas, institucionais), só com endereços indexáveis
export async function GET(_request: Request, { params }: { params: Promise<{ tipo: string }> }) {
  const kind = (await params).tipo.replace(/\.xml$/, '') as SitemapKind
  if (!SITEMAP_KINDS.includes(kind)) return new Response('Não encontrado', { status: 404 })
  const xml = urlsetXml(await sitemapEntries(kind, siteUrl()))
  return new Response(xml, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } })
}
