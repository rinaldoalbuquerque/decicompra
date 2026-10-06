import { expect, test, type Page } from '@playwright/test'

// Começa sem escolha de cookies. O seed de demonstração configura o GA4 "G-DEMO12345".
test.use({ storageState: { cookies: [], origins: [] } })

async function watchGoogle(page: Page) {
  const requests: string[] = []
  await page.route(/googletagmanager\.com|googlesyndication\.com|google-analytics\.com/, (route) => {
    requests.push(route.request().url())
    return route.fulfill({ status: 200, contentType: 'text/javascript', body: '' })
  })
  return requests
}

test.describe('Aviso de cookies', () => {
  test('nenhum script de medição antes do consentimento; "Aceitar todos" carrega o GA4 e a escolha fica guardada', async ({ page }) => {
    const requests = await watchGoogle(page)
    await page.goto('/')
    const banner = page.getByRole('region', { name: 'Aviso de cookies' })
    await expect(banner).toBeVisible()
    await page.waitForLoadState('networkidle')
    expect(requests).toEqual([])

    await banner.getByRole('button', { name: 'Aceitar todos' }).click()
    await expect.poll(() => requests.length).toBeGreaterThan(0)
    expect(requests[0]).toContain('id=G-DEMO12345')
    await expect(banner).toBeHidden()

    await page.reload()
    await expect(page.getByRole('region', { name: 'Aviso de cookies' })).toBeHidden()
  })

  test('"Recusar opcionais" não carrega nada; o rodapé reabre as preferências', async ({ page }) => {
    const requests = await watchGoogle(page)
    await page.goto('/melhores/')
    await page.getByRole('region', { name: 'Aviso de cookies' }).getByRole('button', { name: 'Recusar opcionais' }).click()
    await page.reload()
    await page.waitForLoadState('networkidle')
    expect(requests).toEqual([])

    await page.getByRole('button', { name: 'Preferências de cookies' }).click()
    const banner = page.getByRole('region', { name: 'Aviso de cookies' })
    await expect(banner.getByRole('checkbox', { name: /Estatísticas/ })).not.toBeChecked()
    await expect(banner.getByRole('checkbox', { name: /Necessários/ })).toBeChecked()
    await expect(banner.getByRole('checkbox', { name: /Necessários/ })).toBeDisabled()
  })

  test('personalizar: só estatísticas carrega o GA4, sem anúncios', async ({ page }) => {
    const requests = await watchGoogle(page)
    await page.goto('/guias/')
    const banner = page.getByRole('region', { name: 'Aviso de cookies' })
    await banner.getByRole('button', { name: 'Personalizar' }).click()
    await banner.getByRole('checkbox', { name: /Estatísticas/ }).check()
    await banner.getByRole('button', { name: 'Salvar escolhas' }).click()
    await expect.poll(() => requests.some((url) => url.includes('googletagmanager'))).toBe(true)
    expect(requests.some((url) => url.includes('googlesyndication'))).toBe(false)
  })

  test('revogar o consentimento recarrega a página e nada mais vai para o Google', async ({ page }) => {
    const requests = await watchGoogle(page)
    await page.goto('/')
    await page.getByRole('region', { name: 'Aviso de cookies' }).getByRole('button', { name: 'Aceitar todos' }).click()
    await expect.poll(() => requests.length).toBeGreaterThan(0)

    await page.getByRole('button', { name: 'Preferências de cookies' }).click()
    const banner = page.getByRole('region', { name: 'Aviso de cookies' })
    await banner.getByRole('checkbox', { name: /Estatísticas/ }).uncheck()
    await banner.getByRole('checkbox', { name: /Publicidade/ }).uncheck()
    await Promise.all([page.waitForEvent('load'), banner.getByRole('button', { name: 'Salvar escolhas' }).click()])

    requests.length = 0
    await page.getByRole('navigation', { name: 'Principal' }).getByRole('link', { name: 'Guias' }).click()
    await page.waitForURL(/\/guias\/$/)
    await page.waitForLoadState('networkidle')
    expect(requests).toEqual([])
  })
})
