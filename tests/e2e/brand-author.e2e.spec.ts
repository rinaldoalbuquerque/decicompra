import { expect, test } from '@playwright/test'

// Usa os dados de demonstração (pnpm seed:demo)
test.describe('Marca e autor', () => {
  test('marca: produtos analisados (sem ficha) e conteúdos que a citam', async ({ page }) => {
    const response = await page.goto('/marcas/demo-eletronicos/')
    expect(response?.status()).toBe(200)
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Demo Eletrônicos')
    await expect(page.getByRole('navigation', { name: 'Trilha' })).toContainText('Marcas')

    const products = page.locator('#produtos')
    await expect(products.getByRole('link', { name: 'TV Demo Alfa' })).toBeVisible()
    await expect(products.getByRole('link', { name: 'TV Demo Gama' })).toBeVisible()
    await expect(products.getByRole('link', { name: 'TV Demo Beta' })).toHaveCount(0)

    await expect(page.locator('#conteudos').getByRole('link', { name: 'TV Demo Alfa vs TV Demo Beta: qual comprar?' })).toBeVisible()
    // 2 produtos em análise + 3 conteúdos: indexável (sem noindex próprio da página)
    await expect(page.locator('meta[name="robots"][content="noindex, follow"]')).toHaveCount(0)
  })

  test('autor: bio e conteúdos assinados', async ({ page }) => {
    const response = await page.goto('/autores/equipe-decicompra/')
    expect(response?.status()).toBe(200)
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Equipe DeciCompra')
    const list = page.locator('#conteudos')
    for (const title of ['As melhores TVs de demonstração', 'Como escolher uma TV (demonstração)', 'OLED vs QLED (demonstração)']) {
      await expect(list.getByRole('link', { name: title })).toBeVisible()
    }
  })

  test('marca e autor inexistentes dão 404', async ({ request }) => {
    expect((await request.get('/marcas/nao-existe-demo/')).status()).toBe(404)
    expect((await request.get('/autores/nao-existe-demo/')).status()).toBe(404)
  })
})
