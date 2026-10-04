import { expect, test } from '@playwright/test'

// Usa os dados de demonstração (pnpm seed:demo)
test.describe('Página de produto', () => {
  test('análise com nota, faixa, lojas e aviso de comissão', async ({ page }) => {
    await page.goto('/produtos/demo-tv-alfa/')
    await expect(page.getByRole('heading', { level: 1 })).toContainText('TV Demo Alfa')
    await expect(page.getByRole('navigation', { name: 'Trilha' })).toContainText('Smart TVs')
    await expect(page.getByLabel(/Nota DeciCompra \d,\d de 10/).first()).toBeVisible()

    const box = page.locator('#onde-comprar')
    await expect(box.getByRole('heading', { name: 'Onde comprar' })).toBeVisible()
    const store = box.getByRole('link', { name: 'Ver na Loja Demo A' }).first()
    await expect(store).toHaveAttribute('href', /^\/ir\/\d+$/)
    await expect(store).toHaveAttribute('rel', 'sponsored nofollow noopener')
    await expect(box).toContainText('Podemos receber comissão')
    await expect(box).toContainText('R$')

    await expect(page.getByRole('heading', { name: 'Notas por critério' })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Especificações' })).toBeVisible()
    await expect(page.getByText('Contraste muito alto')).toBeVisible()
  })

  test('produto sem oferta mostra "Indisponível no momento"', async ({ page }) => {
    await page.goto('/produtos/demo-tv-gama/')
    await expect(page.locator('#onde-comprar')).toContainText('Indisponível no momento')
  })

  test('endereço inexistente responde 404', async ({ page }) => {
    const response = await page.goto('/produtos/nao-existe-demo/')
    expect(response?.status()).toBe(404)
  })

  test.describe('celular', () => {
    test.use({ viewport: { width: 390, height: 844 } })

    test('barra fixa leva às lojas', async ({ page }) => {
      await page.goto('/produtos/demo-tv-alfa/')
      const bar = page.getByRole('link', { name: 'Ver lojas' })
      await expect(bar).toBeVisible()
      await bar.click()
      await expect(page).toHaveURL(/#onde-comprar$/)
    })
  })
})
