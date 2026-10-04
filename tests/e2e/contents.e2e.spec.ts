import { expect, test } from '@playwright/test'

// Usa os dados de demonstração (pnpm seed:demo)
test.describe('Páginas de conteúdo', () => {
  test('Melhores: escolhas por perfil, tabela, critérios e lojas', async ({ page }) => {
    await page.goto('/melhores/demo-melhores-tvs/')
    await expect(page.getByRole('heading', { level: 1 })).toContainText('As melhores TVs de demonstração')
    await expect(page.getByText('8 modelos analisados · 3 selecionados')).toBeVisible()

    const picks = page.getByRole('region', { name: 'Nossas escolhas em resumo' })
    await expect(picks).toContainText('Melhor no geral')
    await expect(picks).toContainText('TV Demo Alfa')
    await expect(picks.getByRole('link', { name: /^Ver na Loja Demo/ }).first()).toHaveAttribute('href', /^\/ir\/\d+\/$/)

    await expect(page.getByRole('heading', { name: 'Comparação rápida' })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Como escolhemos estes produtos' })).toBeVisible()
    await expect(page.getByText(/Imagem.*35%/)).toBeVisible()
  })

  test('Guia: resumo, índice e blocos (dica, card, tabela comparativa, FAQ)', async ({ page }) => {
    await page.goto('/guias/demo-guia-como-escolher-tv/')
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Como escolher uma TV')
    await expect(page.getByRole('region', { name: 'Resumo rápido' })).toBeVisible()
    await expect(page.getByRole('navigation', { name: 'Nesta página' }).getByRole('link', { name: 'Tamanho certo' })).toHaveAttribute(
      'href',
      '#tamanho-certo',
    )
    await expect(page.getByText('Para 2 metros de distância, 55" costuma ser o ideal.')).toBeVisible()
    await expect(page.getByRole('link', { name: 'TV Demo Alfa' }).first()).toHaveAttribute('href', '/produtos/demo-tv-alfa/')
    await expect(page.locator('[data-winner="true"]').filter({ hasText: '144' })).toHaveCount(1)
    await expect(page.getByText('OLED queima a tela?')).toBeVisible()
  })

  test('Entenda: lado a lado', async ({ page }) => {
    await page.goto('/entenda/demo-entenda-oled-vs-qled/')
    await expect(page.getByRole('heading', { level: 1 })).toContainText('OLED vs QLED')
    await expect(page.getByText('Cada pixel acende sozinho: preto perfeito.')).toBeVisible()
  })

  test('conteúdo pedido com o tipo errado responde 404', async ({ page }) => {
    const response = await page.goto('/guias/demo-melhores-tvs/')
    expect(response?.status()).toBe(404)
  })
})
