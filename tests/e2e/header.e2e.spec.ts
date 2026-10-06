import { expect, test } from '@playwright/test'

// Usa os dados de demonstração (pnpm seed:demo)
test.describe('Cabeçalho', () => {
  test('busca com sugestões e Enter leva à página de busca', async ({ page }) => {
    await page.goto('/produtos/demo-tv-alfa/')
    const input = page.getByRole('banner').getByRole('combobox', { name: 'Buscar no DeciCompra' })
    await input.fill('alf')
    const listbox = page.getByRole('listbox', { name: 'Sugestões' })
    await expect(listbox.getByRole('option', { name: 'TV Demo Alfa', exact: true })).toBeVisible()
    await input.press('Enter')
    await expect(page).toHaveURL(/\/busca\/\?q=alf$/)
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Busca: alf')
  })

  test('setas e Enter abrem a sugestão escolhida', async ({ page }) => {
    await page.goto('/melhores/')
    const input = page.getByRole('banner').getByRole('combobox', { name: 'Buscar no DeciCompra' })
    await input.fill('alfa')
    await expect(page.getByRole('option', { name: 'TV Demo Alfa', exact: true })).toBeVisible()
    await input.press('ArrowDown')
    await input.press('Enter')
    await expect(page).toHaveURL(/\/produtos\/demo-tv-alfa\/$/)
  })

  test('menu Categorias mostra as subcategorias com conteúdo', async ({ page }) => {
    await page.goto('/melhores/')
    const nav = page.getByRole('navigation', { name: 'Principal' })
    await nav.getByRole('button', { name: /Categorias/ }).click()
    await expect(nav.getByRole('link', { name: 'Smart TVs' })).toHaveAttribute('href', '/tvs-e-entretenimento/smart-tvs/')
    await expect(nav.getByRole('link', { name: 'Soundbars' })).toHaveCount(0)
  })
})
