import { afterAll, beforeAll, describe, expect, it } from 'vitest'

import { searchAll } from '@/lib/data/search'
import { seedDemo } from '@/seed/demo'

import { createBrand, createProduct, Tracker, uid } from './helpers/fixtures'
import { getTestPayload } from './helpers/getTestPayload'

const payloadPromise = getTestPayload()
let tracker: Tracker

beforeAll(async () => {
  const payload = await payloadPromise
  tracker = new Tracker(payload)
  await seedDemo(payload)
})
afterAll(async () => tracker?.cleanup())

const titles = (items: { title: string }[]) => items.map((item) => item.title)

describe('Busca', () => {
  it('acha produto pelo nome, ignorando acento e maiúsculas, com link', async () => {
    for (const term of ['alfa', 'ALFÁ', 'Alf']) {
      const result = await searchAll(term)
      expect(titles(result.products)).toContain('TV Demo Alfa')
    }
    const alfa = (await searchAll('alfa')).products.find((item) => item.title === 'TV Demo Alfa')!
    expect(alfa.href).toBe('/produtos/demo-tv-alfa/')
  })

  it('"tv demo" acha as três TVs públicas (ficha incluída) e os conteúdos', async () => {
    const result = await searchAll('tv demo')
    expect(titles(result.products)).toEqual(expect.arrayContaining(['TV Demo Alfa', 'TV Demo Beta', 'TV Demo Gama']))
    expect(titles(result.comparisons)).toContain('TV Demo Alfa vs TV Demo Beta: qual comprar?')
  })

  it('acha guia, Melhores, marca e subcategoria', async () => {
    expect(titles((await searchAll('como escolher')).articles)).toContain('Como escolher uma TV (demonstração)')
    expect(titles((await searchAll('melhores tvs')).best)).toContain('As melhores TVs de demonstração')
    expect(titles((await searchAll('demo eletronicos')).brands)).toContain('Demo Eletrônicos')
    const subs = (await searchAll('smart')).subcategories
    expect(subs.find((item) => item.title === 'Smart TVs')?.href).toBe('/tvs-e-entretenimento/smart-tvs/')
  })

  it('acha o produto pelo código de modelo da variante', async () => {
    expect(titles((await searchAll('alfa65')).products)).toContain('TV Demo Alfa')
  })

  it('rascunho e subcategoria sem conteúdo não aparecem', async () => {
    const payload = await payloadPromise
    const { docs: subs } = await payload.find({ collection: 'categories', where: { slug: { equals: 'smart-tvs' } }, limit: 1 })
    const brand = await createBrand(payload, tracker)
    const draft = await createProduct(payload, tracker, { subcategoryId: subs[0].id, brandId: brand.id })
    const unique = `Zyxwq${uid()}`
    await payload.update({ collection: 'products', id: draft.id, data: { name: unique } })
    expect((await searchAll(unique)).products).toHaveLength(0)
    expect(titles((await searchAll('soundbars')).subcategories)).not.toContain('Soundbars')
  })

  it('entradas estranhas não quebram', async () => {
    for (const term of ['c++', "o'neill", '%', '\\', '   ', 'a', 'x'.repeat(500), "'); drop table products; --", '&|!:*()']) {
      const result = await searchAll(term)
      expect(Object.values(result).every(Array.isArray)).toBe(true)
    }
  })

  it('marca sem item público não aparece na busca', async () => {
    const payload = await payloadPromise
    const brand = await createBrand(payload, tracker)
    expect(titles((await searchAll(brand.name)).brands)).not.toContain(brand.name)
  })
})
