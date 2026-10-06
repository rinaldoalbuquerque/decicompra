import { expect, test } from '@playwright/test'

// Usa os dados de demonstração (pnpm seed:demo), que preenchem a home vazia
test.describe('Home', () => {
  test('topo, chips, cartões e seções de destaque', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Compare. Entenda. Decida.')
    await expect(page.getByText('Análises independentes · Não vendemos produtos')).toBeVisible()
    await expect(page.getByRole('link', { name: 'TV Demo Alfa' }).first()).toBeVisible()

    const shortcuts = page.getByRole('navigation', { name: 'Atalhos' })
    await expect(shortcuts.getByRole('link', { name: /Procurando um produto/ })).toHaveAttribute('href', '/categorias/')
    await expect(shortcuts.getByRole('link', { name: /Em dúvida entre modelos/ })).toHaveAttribute('href', '/comparar/')
    await expect(shortcuts.getByRole('link', { name: /Não sei qual comprar/ })).toHaveAttribute('href', '/melhores/')

    const looking = page.getByRole('region', { name: 'O que você está procurando?' })
    await expect(looking.getByRole('link', { name: /Smart TVs/ })).toHaveAttribute('href', '/tvs-e-entretenimento/smart-tvs/')
    await expect(looking.getByRole('link', { name: 'TVs & Entretenimento' })).toBeVisible()

    await expect(page.getByRole('region', { name: 'Comparativos em destaque' }).getByRole('link').first()).toHaveAttribute('href', /^\/comparar\//)
    await expect(page.getByRole('region', { name: 'Melhores do momento' }).getByRole('link').first()).toHaveAttribute('href', /^\/melhores\//)
    await expect(page.getByRole('region', { name: 'Guias de compra' }).getByRole('link').first()).toHaveAttribute('href', /^\/guias\//)
    await expect(page.getByRole('region', { name: 'Entenda antes de comprar' }).getByRole('link').first()).toHaveAttribute('href', /^\/entenda\//)

    const recent = page.getByRole('region', { name: 'Análises recentes' })
    await expect(recent.getByRole('link', { name: 'TV Demo Alfa', exact: true })).toBeVisible()
    await expect(recent.getByRole('link', { name: 'TV Demo Beta', exact: true })).toHaveCount(0)

    await expect(page.getByRole('region', { name: 'Por que confiar no DeciCompra' })).toContainText('Critérios públicos')
  })

  test('a busca principal envia para /busca/', async ({ page }) => {
    await page.goto('/')
    const main = page.locator('#busca-principal')
    await main.getByRole('searchbox').fill('alfa')
    await main.getByRole('button', { name: 'Buscar' }).click()
    await expect(page).toHaveURL(/\/busca\/\?q=alfa$/)
  })

  test('busca do cabeçalho só aparece depois de rolar além da busca principal', async ({ page }) => {
    await page.goto('/')
    const headerSearch = page.getByRole('banner').getByRole('combobox', { name: 'Buscar no DeciCompra' })
    await expect(headerSearch).toBeHidden()
    await page.locator('#por-que-confiar').scrollIntoViewIfNeeded()
    await expect(headerSearch).toBeVisible()
  })

  test.describe('celular', () => {
    test.use({ viewport: { width: 390, height: 844 } })

    test('a imagem do topo não aparece', async ({ page }) => {
      await page.goto('/')
      await expect(page.locator('[data-hero-image]')).toBeHidden()
    })
  })
})
