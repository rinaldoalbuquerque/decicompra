import { expect, test } from '@playwright/test'

// Usa os dados de demonstração (pnpm seed:demo)
test('404 com mensagem, busca, categorias e conteúdos populares', async ({ page }) => {
  const response = await page.goto('/produtos/nao-existe/')
  expect(response?.status()).toBe(404)
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Não encontramos esta página')
  const main = page.getByRole('main')
  await expect(main.getByRole('searchbox', { name: 'Buscar' })).toBeVisible()
  await expect(main.getByRole('link', { name: /Smart TVs/ })).toHaveAttribute('href', '/tvs-e-entretenimento/smart-tvs/')
  await expect(page.getByRole('region', { name: 'Conteúdos populares' }).getByRole('link', { name: 'As melhores TVs de demonstração' })).toBeVisible()
  await expect(main.getByRole('link', { name: 'Voltar ao início' })).toHaveAttribute('href', '/')
})

test('endereço que não casa com nenhuma rota também mostra o 404 do site', async ({ page }) => {
  const response = await page.goto('/um/dois/tres/')
  expect(response?.status()).toBe(404)
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Não encontramos esta página')
  await expect(page.getByRole('searchbox', { name: 'Buscar' }).first()).toBeVisible()
  await expect(page.getByRole('link', { name: 'Voltar ao início' })).toHaveAttribute('href', '/')
})
