import { afterAll, beforeAll, describe, expect, it } from 'vitest'

import { getPublicContent, getRelatedForProduct } from '@/lib/data/contents'
import { getProductSummaries, getPublicProduct } from '@/lib/data/products'
import { seedDemo } from '@/seed/demo'

import { createBrand, createCategoryPair, createProduct, Tracker } from './helpers/fixtures'
import { getTestPayload } from './helpers/getTestPayload'

const payloadPromise = getTestPayload()
let tracker: Tracker

beforeAll(async () => seedDemo(await payloadPromise))
afterAll(async () => tracker?.cleanup())

describe('Carga de dados das páginas', () => {
  it('produto público traz variantes, ofertas por variante e subcategoria com regras', async () => {
    const page = await getPublicProduct('demo-tv-alfa')
    expect(page).not.toBeNull()
    expect(page!.product.name).toBe('TV Demo Alfa')
    expect(page!.variants.map((v) => v.label)).toEqual(['55"', '65"'])
    expect(page!.variants[0].offers.map((o) => o.storeName).sort()).toEqual(['Loja Demo A', 'Loja Demo B'])
    expect(page!.criteria.map((c) => c.key)).toContain('imagem')
    expect(page!.template.map((a) => a.key)).toContain('painel')
    expect(page!.summary.scoreText).toBe(page!.product.finalScore?.toFixed(1).replace('.', ','))
  })

  it('produto em rascunho ou inexistente não carrega; resumos ignoram rascunho', async () => {
    const payload = await payloadPromise
    tracker = new Tracker(payload)
    const { subcategory } = await createCategoryPair(payload, tracker)
    const brand = await createBrand(payload, tracker)
    const draft = await createProduct(payload, tracker, { subcategoryId: subcategory.id, brandId: brand.id })
    expect(await getPublicProduct(draft.slug!)).toBeNull()
    expect(await getPublicProduct('nao-existe-mesmo')).toBeNull()

    const alfa = (await getPublicProduct('demo-tv-alfa'))!
    const summaries = await getProductSummaries([alfa.product.id, draft.id])
    expect([...summaries.keys()]).toEqual([alfa.product.id])
  })

  it('conteúdo público por tipo e relacionados do produto', async () => {
    const comparison = await getPublicContent('comparativo', 'demo-tv-alfa-vs-demo-tv-beta')
    expect(comparison?.title).toContain('TV Demo Alfa vs TV Demo Beta')
    expect(await getPublicContent('guia', 'demo-tv-alfa-vs-demo-tv-beta')).toBeNull()

    const alfa = (await getPublicProduct('demo-tv-alfa'))!
    const related = await getRelatedForProduct(alfa.product.id)
    expect(related.map((c) => c.slug).sort()).toEqual(['demo-melhores-tvs', 'demo-tv-alfa-vs-demo-tv-beta'])
  })
})
