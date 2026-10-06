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
