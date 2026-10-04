import { afterAll, describe, expect, it } from 'vitest'

import { createBrand, createCategoryPair, createImage, createProduct, makePublishable, sampleSpecTemplate, Tracker } from './helpers/fixtures'
import { getTestPayload } from './helpers/getTestPayload'

const payloadPromise = getTestPayload()
let tracker: Tracker

afterAll(async () => tracker?.cleanup())

describe('Mudança de pesos e de modelo na subcategoria', () => {
  it('recalcula a nota de produtos publicados e adiciona as linhas novas, sem bloquear o salvamento', async () => {
    const payload = await payloadPromise
    tracker = new Tracker(payload)
    const { subcategory } = await createCategoryPair(payload, tracker)
    const brand = await createBrand(payload, tracker)
    const product = await createProduct(payload, tracker, { subcategoryId: subcategory.id, brandId: brand.id })
    const image = await createImage(payload, tracker)
    const published = await makePublishable(payload, product.id, image.id)
    expect(published.finalScore).toBe(8.6)

    await payload.update({
      collection: 'categories',
      id: subcategory.id,
      data: {
        criteria: [
          { key: 'imagem', name: 'Imagem', weight: 20 },
          { key: 'custo_beneficio', name: 'Custo-benefício', weight: 80 },
        ],
        specTemplate: [
          ...sampleSpecTemplate,
          { key: 'hdmi', label: 'Portas HDMI', type: 'number', required: true },
          { key: 'cor', label: 'Cor', type: 'text', perVariant: true },
        ],
      },
    })

    const after = await payload.findByID({ collection: 'products', id: product.id, depth: 0 })
    expect(after.finalScore).toBe(8.2)
    expect(after.status).toBe('ficha')
    expect(after.specs?.map((r) => r.key)).toContain('hdmi')
    expect(after.scores?.map((r) => r.label)).toEqual(['Imagem (20%)', 'Custo-benefício (80%)'])

    const [variant] = (await payload.find({ collection: 'variants', where: { product: { equals: product.id } } })).docs
    expect(variant.specs?.map((r) => r.key)).toEqual(['tamanho', 'cor'])
  })
})
