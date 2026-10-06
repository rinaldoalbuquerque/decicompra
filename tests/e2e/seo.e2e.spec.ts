import { expect, test } from '@playwright/test'

// Usa os dados de demonstração (pnpm seed:demo). Sem NEXT_PUBLIC_SITE_URL, o site é http://localhost:3000.
const BASE = 'http://localhost:3000'

test.describe('SEO', () => {
  const pages = [
    '/',
    '/produtos/demo-tv-alfa/',
    '/comparar/demo-tv-alfa-vs-demo-tv-beta/',
    '/melhores/demo-melhores-tvs/',
    '/guias/demo-guia-como-escolher-tv/',
    '/entenda/demo-entenda-oled-vs-qled/',
    '/tvs-e-entretenimento/',
    '/tvs-e-entretenimento/smart-tvs/',
    '/marcas/demo-eletronicos/',
    '/autores/equipe-decicompra/',
    '/melhores/',
    '/categorias/',
  ]

  for (const path of pages) {
    test(`canônico autorreferente e Open Graph em ${path}`, async ({ page }) => {
      await page.goto(path)
      await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', `${BASE}${path}`)
      await expect(page.locator('meta[property="og:site_name"]')).toHaveAttribute('content', 'DeciCompra')
      await expect(page.locator('meta[property="og:url"]')).toHaveAttribute('content', `${BASE}${path}`)
      await expect(page.locator('meta[name="twitter:card"]')).toHaveAttribute('content', 'summary_large_image')
    })
  }

  test('canônico ignora parâmetros de rastreamento', async ({ page }) => {
    await page.goto('/produtos/demo-tv-alfa/?utm_source=teste')
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', `${BASE}/produtos/demo-tv-alfa/`)
  })

  test('antes do lançamento: robots.txt bloqueia tudo e as páginas têm noindex', async ({ page, request }) => {
    const robots = await request.get('/robots.txt')
    expect(robots.status()).toBe(200)
    expect(await robots.text()).toMatch(/Disallow: \/\s*$/m)
    await page.goto('/')
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex, nofollow')
  })

  test('ads.txt é servido como texto', async ({ request }) => {
    const response = await request.get('/ads.txt')
    expect(response.status()).toBe(200)
    expect(response.headers()['content-type']).toContain('text/plain')
  })
})

test.describe('Sitemap', () => {
  test('índice em /sitemap.xml aponta um sitemap por tipo', async ({ request }) => {
    const response = await request.get('/sitemap.xml', { maxRedirects: 0 })
    expect(response.status()).toBe(200)
    expect(response.headers()['content-type']).toContain('xml')
    const xml = await response.text()
    expect(xml).toContain('<sitemapindex')
    expect(xml).toContain(`${BASE}/sitemaps/produtos.xml`)
  })

  test('sitemap de produtos lista só os indexáveis; tipo desconhecido dá 404', async ({ request }) => {
    const response = await request.get('/sitemaps/produtos.xml', { maxRedirects: 0 })
    expect(response.status()).toBe(200)
    const xml = await response.text()
    expect(xml).toContain(`<loc>${BASE}/produtos/demo-tv-alfa/</loc>`)
    expect(xml).not.toContain('demo-tv-beta')
    expect((await request.get('/sitemaps/nao-existe.xml', { maxRedirects: 0 })).status()).toBe(404)
  })
})
