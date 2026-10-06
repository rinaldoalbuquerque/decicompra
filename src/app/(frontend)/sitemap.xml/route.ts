import { sitemapIndexXml } from '@/content/sitemap'
import { siteUrl } from '@/lib/site-url'

export const revalidate = 3600

// Índice de sitemaps (spec §11): um por tipo, em /sitemaps/{tipo}.xml
export async function GET() {
  return new Response(sitemapIndexXml(siteUrl()), { headers: { 'Content-Type': 'application/xml; charset=utf-8' } })
}
