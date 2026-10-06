import { expect, test } from '@playwright/test'

// Usa os dados de demonstração (pnpm seed:demo)
test.describe('Endereços antigos', () => {
  test('redirecionamento salvo responde 301 para o endereço novo', async ({ request }) => {
    const response = await request.get('/produtos/demo-tv-antiga/', { maxRedirects: 0 })
    expect([301, 308]).toContain(response.status())
    expect(response.headers()['location']).toMatch(/\/produtos\/demo-tv-alfa\/$/)
  })

  test('comparativo em outra ordem vai para o endereço canônico', async ({ request }) => {
    const response = await request.get('/comparar/demo-tv-beta-vs-demo-tv-alfa/', { maxRedirects: 0 })
    expect([301, 308]).toContain(response.status())
    expect(response.headers()['location']).toMatch(/\/comparar\/demo-tv-alfa-vs-demo-tv-beta\/$/)
  })

  test('comparativo antigo pedido em outra ordem também redireciona', async ({ request }) => {
    const response = await request.get('/comparar/demo-tv-velha-vs-demo-tv-alfa/', { maxRedirects: 0 })
    expect([301, 308]).toContain(response.status())
    expect(response.headers()['location']).toMatch(/\/comparar\/demo-tv-alfa-vs-demo-tv-beta\/$/)
  })

  test('comparativo inexistente em qualquer ordem dá 404', async ({ request }) => {
    const response = await request.get('/comparar/zz-nao-existe-vs-aa-nao-existe/', { maxRedirects: 0 })
    expect(response.status()).toBe(404)
  })
})
