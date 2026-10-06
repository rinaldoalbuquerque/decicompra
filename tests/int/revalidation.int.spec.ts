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

  it('mover uma oferta para outro produto atualiza a página dos dois', async () => {
    const payload = await payloadPromise
    const product = async (slug: string) => (await payload.find({ collection: 'products', where: { slug: { equals: slug } }, limit: 1 })).docs[0]
    const [alfa, beta] = [await product('demo-tv-alfa'), await product('demo-tv-beta')]
    const { docs: betaVariants } = await payload.find({ collection: 'variants', where: { product: { equals: beta.id } }, limit: 1 })
    const { docs: alfaVariants } = await payload.find({ collection: 'variants', where: { product: { equals: alfa.id } }, limit: 1 })
    const { docs } = await payload.find({ collection: 'offers', where: { product: { equals: alfa.id } }, limit: 1, depth: 0 })
    const original = docs[0]
    calls.length = 0
    await payload.update({ collection: 'offers', id: original.id, data: { product: beta.id, variant: betaVariants[0].id } })
    try {
      expect(calls).toEqual(expect.arrayContaining(['/produtos/demo-tv-alfa/', '/produtos/demo-tv-beta/']))
    } finally {
      await payload.update({ collection: 'offers', id: original.id, data: { product: alfa.id, variant: alfaVariants[0].id } })
    }
  })

  it('salvar uma loja só atualiza os produtos quando muda o que aparece (nome, ativa, logo)', async () => {
    const payload = await payloadPromise
    const { docs } = await payload.find({ collection: 'stores', where: { slug: { equals: 'demo-loja-a' } }, limit: 1 })
    const store = docs[0]
    calls.length = 0
    await payload.update({ collection: 'stores', id: store.id, data: { name: store.name } })
    expect(calls).not.toContain('/produtos/demo-tv-alfa/')

    calls.length = 0
    await payload.update({ collection: 'stores', id: store.id, data: { name: `${store.name} X` } })
    try {
      expect(calls).toEqual(expect.arrayContaining(['/produtos/demo-tv-alfa/', '/melhores/demo-melhores-tvs/', '/']))
    } finally {
      await payload.update({ collection: 'stores', id: store.id, data: { name: store.name } })
    }
  })

  it('salvar um conteúdo atualiza a página dos produtos que ele cita (bloco Alternativas e comparativos)', async () => {
    const payload = await payloadPromise
    const { docs } = await payload.find({ collection: 'contents', where: { slug: { equals: 'demo-melhores-tvs' } }, limit: 1 })
    calls.length = 0
    await payload.update({ collection: 'contents', id: docs[0].id, data: { summary: docs[0].summary } })
    expect(calls).toEqual(expect.arrayContaining(['/produtos/demo-tv-alfa/', '/produtos/demo-tv-beta/']))
  })

  it('mudar o status de um produto atualiza os outros da mesma subcategoria (bloco Alternativas)', async () => {
    const payload = await payloadPromise
    const { docs } = await payload.find({ collection: 'products', where: { slug: { equals: 'demo-tv-gama' } }, limit: 1 })
    const gama = docs[0]
    calls.length = 0
    await payload.update({ collection: 'products', id: gama.id, data: { status: 'ficha' } })
    try {
      expect(calls).toEqual(expect.arrayContaining(['/produtos/demo-tv-gama/', '/produtos/demo-tv-alfa/', '/produtos/demo-tv-beta/']))
    } finally {
      await payload.update({ collection: 'products', id: gama.id, data: { status: gama.status } })
    }
  })
})
