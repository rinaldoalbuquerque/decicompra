import { beforeAll, describe, expect, it } from 'vitest'

import { sitemapEntries } from '@/lib/data/sitemap'
import { seedDemo } from '@/seed/demo'

import { getTestPayload } from './helpers/getTestPayload'

const BASE = 'https://exemplo.com'
const locs = async (kind: Parameters<typeof sitemapEntries>[0]) => (await sitemapEntries(kind, BASE)).map((entry) => entry.loc)

beforeAll(async () => seedDemo(await getTestPayload()))

describe('Dados do sitemap (só endereços indexáveis)', () => {
  it('produtos: só em análise, com data', async () => {
    const entries = await sitemapEntries('produtos', BASE)
    const alfa = entries.find((entry) => entry.loc === `${BASE}/produtos/demo-tv-alfa/`)
    expect(alfa?.lastmod).toBeTruthy()
    expect(entries.map((entry) => entry.loc)).not.toContain(`${BASE}/produtos/demo-tv-beta/`)
  })

  it('conteúdos públicos de todos os tipos', async () => {
    expect(await locs('conteudos')).toEqual(
      expect.arrayContaining([
        `${BASE}/comparar/demo-tv-alfa-vs-demo-tv-beta/`,
        `${BASE}/melhores/demo-melhores-tvs/`,
        `${BASE}/guias/demo-guia-como-escolher-tv/`,
        `${BASE}/entenda/demo-entenda-oled-vs-qled/`,
      ]),
    )
  })

  it('taxonomia: home, índices e categorias com item público (sem as vazias)', async () => {
    const result = await locs('taxonomia')
    expect(result).toEqual(
      expect.arrayContaining([`${BASE}/`, `${BASE}/categorias/`, `${BASE}/melhores/`, `${BASE}/tvs-e-entretenimento/`, `${BASE}/tvs-e-entretenimento/smart-tvs/`]),
    )
    expect(result).not.toContain(`${BASE}/tvs-e-entretenimento/soundbars/`)
  })

  it('marcas com 3+ itens públicos; institucionais e autores', async () => {
    expect(await locs('marcas')).toContain(`${BASE}/marcas/demo-eletronicos/`)
    const institutional = await locs('institucionais')
    expect(institutional).toEqual(expect.arrayContaining([`${BASE}/sobre/`, `${BASE}/privacidade/`, `${BASE}/autores/equipe-decicompra/`]))
  })
})
