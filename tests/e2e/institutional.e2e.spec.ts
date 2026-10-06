import { expect, test } from '@playwright/test'

// Páginas institucionais (spec §6.12). Usa os dados de demonstração.
const PAGES: [string, string][] = [
  ['/sobre/', 'Sobre o DeciCompra'],
  ['/como-avaliamos/', 'Como avaliamos os produtos'],
  ['/politica-editorial/', 'Política editorial'],
  ['/divulgacao-de-afiliados/', 'Divulgação de afiliados'],
  ['/publicidade-e-transparencia/', 'Publicidade e transparência'],
  ['/privacidade/', 'Política de privacidade'],
  ['/cookies/', 'Política de cookies'],
  ['/termos/', 'Termos de uso'],
]

test.describe('Páginas institucionais', () => {
  for (const [path, title] of PAGES) {
    test(`${path} abre com título, trilha e data de atualização`, async ({ page }) => {
      const response = await page.goto(path)
      expect(response?.status()).toBe(200)
      await expect(page.getByRole('heading', { level: 1 })).toHaveText(title)
      await expect(page.getByRole('navigation', { name: 'Trilha' })).toContainText('Início')
      await expect(page.getByText(/Atualizado em \d{2}\/\d{2}\/\d{4}/)).toBeVisible()
    })
  }

  test('Como avaliamos: princípios e pesos das subcategorias publicadas', async ({ page }) => {
    await page.goto('/como-avaliamos/')
    await expect(page.getByText(/sem testes físicos/i).first()).toBeVisible()
    await expect(page.getByText(/comissão nunca altera/i).first()).toBeVisible()
    const weights = page.getByRole('region', { name: 'Smart TVs' })
    await expect(weights).toContainText('%')
  })

  test('Divulgação de afiliados lista as lojas ativas', async ({ page }) => {
    await page.goto('/divulgacao-de-afiliados/')
    await expect(page.getByText('Loja Demo A')).toBeVisible()
    await expect(page.getByText(/não muda o preço/i).first()).toBeVisible()
  })

  test('Privacidade: controlador, direitos do titular e canal de privacidade', async ({ page }) => {
    await page.goto('/privacidade/')
    await expect(page.getByRole('heading', { name: /Seus direitos/ })).toBeVisible()
    await expect(page.getByRole('link', { name: /formulário de contato/i }).first()).toHaveAttribute('href', '/contato/')
  })

  test('Cookies: lista as categorias e reabre as preferências', async ({ page }) => {
    await page.goto('/cookies/')
    for (const name of ['Necessários', 'Estatísticas', 'Publicidade']) await expect(page.getByRole('heading', { name })).toBeVisible()
    await page.getByRole('main').getByRole('button', { name: 'Preferências de cookies' }).click()
    await expect(page.getByRole('region', { name: 'Aviso de cookies' })).toBeVisible()
  })
})
