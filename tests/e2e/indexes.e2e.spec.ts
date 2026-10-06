import { expect, test } from '@playwright/test'

// Usa os dados de demonstração (pnpm seed:demo)
test.describe('Índices', () => {
  test('/melhores/ lista o Melhores de demonstração', async ({ page }) => {
    const response = await page.goto('/melhores/')
    expect(response?.status()).toBe(200)
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Melhores')
    await expect(page.getByRole('link', { name: 'As melhores TVs de demonstração' })).toHaveAttribute('href', '/melhores/demo-melhores-tvs/')
  })

  test('/comparar/ e /entenda/ listam os de demonstração', async ({ page }) => {
    await page.goto('/comparar/')
    await expect(page.getByRole('link', { name: 'TV Demo Alfa vs TV Demo Beta: qual comprar?' })).toBeVisible()
    await page.goto('/entenda/')
    await expect(page.getByRole('link', { name: 'OLED vs QLED (demonstração)' })).toBeVisible()
  })

  test('filtro por categoria: com e sem resultados', async ({ page }) => {
    await page.goto('/guias/?categoria=tvs-e-entretenimento')
    await expect(page.getByRole('link', { name: 'Como escolher uma TV (demonstração)' })).toBeVisible()
    await expect(page.getByLabel('Filtrar por categoria').getByRole('link', { name: 'TVs & Entretenimento' })).toHaveAttribute('aria-current', 'page')

    await page.goto('/guias/?categoria=tecnologia')
    await expect(page.getByRole('link', { name: 'Como escolher uma TV (demonstração)' })).toHaveCount(0)
    await expect(page.getByRole('link', { name: 'Ver todos' })).toHaveAttribute('href', '/guias/')

    const unknown = await page.goto('/guias/?categoria=nao-existe')
    expect(unknown?.status()).toBe(200)
  })

  test('paginação além da última dá 404', async ({ request }) => {
    expect((await request.get('/guias/?pagina=50')).status()).toBe(404)
  })

  test('/categorias/ mostra só subcategorias com conteúdo', async ({ page }) => {
    await page.goto('/categorias/')
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Categorias')
    await expect(page.getByRole('link', { name: /Smart TVs/ })).toHaveAttribute('href', '/tvs-e-entretenimento/smart-tvs/')
    await expect(page.getByRole('link', { name: /^Soundbars/ })).toHaveCount(0)
  })

  test('/marcas/ lista as marcas com itens públicos', async ({ page }) => {
    await page.goto('/marcas/')
    await expect(page.getByRole('link', { name: 'Demo Eletrônicos' })).toHaveAttribute('href', '/marcas/demo-eletronicos/')
  })
})
