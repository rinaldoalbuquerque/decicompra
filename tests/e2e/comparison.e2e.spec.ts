import { expect, test } from '@playwright/test'

// Usa os dados de demonstração (pnpm seed:demo)
test.describe('Página de comparativo', () => {
  test('veredito, "escolha qual se", placar por critério, especificações e lojas', async ({ page }) => {
    await page.goto('/comparar/demo-tv-alfa-vs-demo-tv-beta/')
    await expect(page.getByRole('heading', { level: 1 })).toContainText('TV Demo Alfa vs TV Demo Beta')

    const verdict = page.getByRole('region', { name: 'Veredito rápido' })
    await expect(verdict).toContainText('Vencedora geral')
    await expect(verdict).toContainText('Melhor custo-benefício')

    await expect(page.getByRole('heading', { name: 'Escolha qual se…' })).toBeVisible()
    await expect(page.getByText('joga em console e quer 144 Hz')).toBeVisible()

    const scoreboard = page.locator('#criterios')
    await expect(scoreboard.getByRole('heading', { name: 'Quem vence em cada critério' })).toBeVisible()
    await expect(scoreboard).toContainText('Placar')

    const specs = page.locator('#especificacoes')
    await expect(specs.locator('[data-winner="true"]').filter({ hasText: '144' })).toHaveCount(1)
    await expect(specs.getByLabel('Mostrar só as diferenças')).toBeVisible()

    await expect(page.getByRole('link', { name: 'Ver na Loja Demo B' }).first()).toHaveAttribute('href', /^\/ir\/\d+$/)
  })

  test('comparativo inexistente responde 404', async ({ page }) => {
    const response = await page.goto('/comparar/nao-existe-vs-demo/')
    expect(response?.status()).toBe(404)
  })
})
