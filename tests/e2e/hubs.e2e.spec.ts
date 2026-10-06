import { expect, test } from '@playwright/test'

// Usa os dados de demonstração (pnpm seed:demo) e a taxonomia do seed
test.describe('Categoria e subcategoria', () => {
  test('categoria lista só as subcategorias com conteúdo e os destaques', async ({ page }) => {
    const response = await page.goto('/tvs-e-entretenimento/')
    expect(response?.status()).toBe(200)
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('TVs & Entretenimento')
    await expect(page.getByRole('link', { name: /Smart TVs/ }).first()).toHaveAttribute('href', '/tvs-e-entretenimento/smart-tvs/')
    await expect(page.getByRole('link', { name: /^Soundbars/ })).toHaveCount(0)
    await expect(page.getByRole('link', { name: 'As melhores TVs de demonstração' }).first()).toBeVisible()
  })

  test('hub da subcategoria: Melhores, guias, comparativos, produtos analisados e critérios', async ({ page }) => {
    await page.goto('/tvs-e-entretenimento/smart-tvs/')
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Smart TVs')
    await expect(page.getByRole('navigation', { name: 'Trilha' })).toContainText('TVs & Entretenimento')

    const products = page.locator('#produtos')
    await expect(products.getByRole('link', { name: 'TV Demo Alfa' })).toBeVisible()
    await expect(products.getByRole('link', { name: 'TV Demo Gama' })).toBeVisible()
    await expect(products.getByRole('link', { name: 'TV Demo Beta' })).toHaveCount(0)

    await expect(page.locator('#guias').getByRole('link').first()).toHaveAttribute('href', /^\/guias\//)
    await expect(page.locator('#comparativos').getByRole('link').first()).toHaveAttribute('href', /^\/comparar\//)
    await expect(page.locator('#entenda').getByRole('link').first()).toHaveAttribute('href', /^\/entenda\//)
    await expect(page.locator('#criterios')).toContainText('%')
    await expect(page.locator('#criterios').getByRole('link', { name: /Como avaliamos/ })).toHaveAttribute('href', '/como-avaliamos/')
  })

  test('subcategoria sem conteúdo abre com estado vazio e noindex', async ({ page }) => {
    const response = await page.goto('/tvs-e-entretenimento/soundbars/')
    expect(response?.status()).toBe(200)
    await expect(page.getByText(/Ainda estamos preparando/)).toBeVisible()
    await expect(page.locator('meta[name="robots"][content*="noindex"]')).toHaveCount(1)
  })

  test('subcategoria sob a categoria errada e categoria inexistente dão 404', async ({ request }) => {
    expect((await request.get('/eletroportateis/smart-tvs/')).status()).toBe(404)
    expect((await request.get('/categoria-que-nao-existe/')).status()).toBe(404)
  })

  test('paginação: além da última dá 404; valor inválido mostra a página 1', async ({ request, page }) => {
    expect((await request.get('/tvs-e-entretenimento/smart-tvs/?pagina=99')).status()).toBe(404)
    const response = await page.goto('/tvs-e-entretenimento/smart-tvs/?pagina=abc')
    expect(response?.status()).toBe(200)
    await expect(page.locator('#produtos').getByRole('link', { name: 'TV Demo Alfa' })).toBeVisible()
  })
})
