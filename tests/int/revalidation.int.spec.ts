import { afterAll, beforeAll, describe, expect, it } from 'vitest'

import { setRevalidator } from '@/lib/revalidate'
import { seedDemo } from '@/seed/demo'

import { getTestPayload } from './helpers/getTestPayload'

const payloadPromise = getTestPayload()
const calls: string[] = []

beforeAll(async () => {
  await seedDemo(await payloadPromise)
  setRevalidator((path) => {
    calls.push(path)
  })
})
afterAll(() => setRevalidator(null))

describe('Atualização das páginas ao salvar', () => {
  it('salvar uma oferta atualiza a página do produto, os conteúdos que o citam e a home', async () => {
    const payload = await payloadPromise
    const { docs } = await payload.find({ collection: 'offers', where: { 'product.slug': { equals: 'demo-tv-alfa' } }, limit: 1 })
    calls.length = 0
    await payload.update({ collection: 'offers', id: docs[0].id, data: { verifiedAt: new Date().toISOString() } })
    expect(calls).toEqual(
      expect.arrayContaining(['/produtos/demo-tv-alfa/', '/comparar/demo-tv-alfa-vs-demo-tv-beta/', '/melhores/demo-melhores-tvs/', '/']),
    )
  })

  it('salvar um conteúdo atualiza a página dele e o índice do tipo', async () => {
    const payload = await payloadPromise
    const { docs } = await payload.find({ collection: 'contents', where: { slug: { equals: 'demo-guia-como-escolher-tv' } }, limit: 1 })
    calls.length = 0
    await payload.update({ collection: 'contents', id: docs[0].id, data: { summary: docs[0].summary } })
    expect(calls).toEqual(expect.arrayContaining(['/guias/demo-guia-como-escolher-tv/', '/guias/', '/']))
  })
})
