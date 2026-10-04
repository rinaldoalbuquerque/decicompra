import { expect, test } from '@playwright/test'

test('home mostra slogan, cabeçalho, rodapé e não é indexável antes do lançamento', async ({ page }) => {
  await page.goto('/')
  await expect(page).toHaveTitle('DeciCompra · Compare. Entenda. Decida.')
  await expect(page.locator('html')).toHaveAttribute('lang', 'pt-BR')
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex, nofollow')
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Compare. Entenda. Decida.')
  await expect(page.getByRole('navigation', { name: 'Principal' }).getByRole('link')).toHaveText([
    'Categorias',
    'Melhores',
    'Comparativos',
    'Guias',
    'Entenda',
  ])
  await expect(page.getByRole('contentinfo')).toContainText('Não vendemos produtos.')
})

test.describe('celular', () => {
  test.use({ viewport: { width: 390, height: 844 } })

  test('menu abre, mostra os links e fecha com Esc', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByRole('navigation', { name: 'Principal' })).toBeHidden()
    await page.getByRole('button', { name: 'Abrir menu' }).click()

    const menu = page.getByRole('navigation', { name: 'Menu' })
    await expect(menu.getByRole('link', { name: 'Melhores' })).toBeVisible()

    await page.keyboard.press('Escape')
    await expect(menu).toBeHidden()
    await expect(page.getByRole('button', { name: 'Abrir menu' })).toBeFocused()
  })
})

test.describe('sem JavaScript', () => {
  test.use({ javaScriptEnabled: false })

  test('a navegação principal funciona no desktop', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByRole('navigation', { name: 'Principal' }).getByRole('link', { name: 'Guias' })).toBeVisible()
  })
})

test('painel administrativo carrega', async ({ page }) => {
  // No modo dev, a primeira compilação da API do painel pode levar ~30 s
  test.setTimeout(120_000)
  const response = await page.goto('/admin')
  expect(response?.status()).toBeLessThan(400)
  await expect(page.locator('input[name="email"]')).toBeVisible({ timeout: 90_000 })
})
