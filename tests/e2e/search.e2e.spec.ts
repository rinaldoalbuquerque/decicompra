import { expect, test } from '@playwright/test'

// Usa os dados de demonstração (pnpm seed:demo)
test.describe('Busca', () => {
  test('resultados agrupados, com produto e comparativo, e noindex', async ({ page }) => {
    const response = await page.goto('/busca/?q=alfa')
    expect(response?.status()).toBe(200)
    await expect(page.getByRole('searchbox', { name: 'Buscar' }).first()).toHaveValue('alfa')
    await expect(page.getByRole('region', { name: 'Produtos' }).getByRole('link', { name: 'TV Demo Alfa' })).toHaveAttribute(
      'href',
      '/produtos/demo-tv-alfa/',
    )
    await expect(page.getByRole('region', { name: 'Comparativos' }).getByRole('link').first()).toHaveAttribute('href', /^\/comparar\//)
    await expect(page.locator('meta[name="robots"][content*="noindex"]')).toHaveCount(1)
  })

  test('sem resultados: mensagem e categorias', async ({ page }) => {
    await page.goto('/busca/?q=zzzzqqq')
    await expect(page.getByText('Nada encontrado para “zzzzqqq”')).toBeVisible()
    await expect(page.getByRole('link', { name: /Smart TVs/ }).first()).toBeVisible()
  })

  test('termo curto pede mais letras', async ({ page }) => {
    const response = await page.goto('/busca/?q=a')
    expect(response?.status()).toBe(200)
    await expect(page.getByText(/pelo menos 2 letras/)).toBeVisible()
  })

  test('sugestões: JSON com até 6 itens e cache público', async ({ request }) => {
    const response = await request.get('/busca/sugestoes/?q=al')
    expect(response.status()).toBe(200)
    expect(response.headers()['cache-control']).toContain('s-maxage=300')
    const body = (await response.json()) as { groups: { type: string; label: string; items: { title: string; href: string }[] }[] }
    const all = body.groups.flatMap((group) => group.items)
    expect(all.length).toBeGreaterThan(0)
    expect(all.length).toBeLessThanOrEqual(6)
    expect(all.map((item) => item.title)).toContain('TV Demo Alfa')

    const short = await request.get('/busca/sugestoes/?q=a')
    expect(await short.json()).toEqual({ groups: [] })
  })
})
