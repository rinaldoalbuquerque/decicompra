import { describe, expect, it } from 'vitest'

import { INSTITUTIONAL_PAGES, SITEMAP_KINDS, sitemapIndexXml, urlsetXml } from '@/content/sitemap'

describe('sitemap', () => {
  it('urlset com loc escapado e lastmod em ISO', () => {
    const xml = urlsetXml([
      { loc: 'https://x.com/produtos/a/', lastmod: '2026-10-01T12:00:00.000Z' },
      { loc: 'https://x.com/busca/?q=a&b=<c>' },
    ])
    expect(xml.startsWith('<?xml version="1.0" encoding="UTF-8"?>')).toBe(true)
    expect(xml).toContain('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">')
    expect(xml).toContain('<url><loc>https://x.com/produtos/a/</loc><lastmod>2026-10-01T12:00:00.000Z</lastmod></url>')
    expect(xml).toContain('<loc>https://x.com/busca/?q=a&amp;b=&lt;c&gt;</loc>')
    expect(xml).not.toContain('<lastmod></lastmod>')
  })

  it('lastmod inválido é omitido', () => {
    expect(urlsetXml([{ loc: 'https://x.com/', lastmod: 'ontem' }])).not.toContain('lastmod')
  })

  it('índice aponta um sitemap por tipo', () => {
    const xml = sitemapIndexXml('https://x.com')
    expect(xml).toContain('<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">')
    for (const kind of SITEMAP_KINDS) expect(xml).toContain(`<sitemap><loc>https://x.com/sitemaps/${kind}.xml</loc></sitemap>`)
    expect(SITEMAP_KINDS).toEqual(['produtos', 'conteudos', 'taxonomia', 'marcas', 'institucionais'])
  })

  it('as páginas institucionais da spec §3.2 estão listadas', () => {
    expect(INSTITUTIONAL_PAGES.map((page) => page.path)).toEqual([
      '/sobre/',
      '/contato/',
      '/como-avaliamos/',
      '/politica-editorial/',
      '/divulgacao-de-afiliados/',
      '/publicidade-e-transparencia/',
      '/privacidade/',
      '/cookies/',
      '/termos/',
    ])
  })
})
