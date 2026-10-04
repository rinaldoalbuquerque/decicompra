import { afterAll, beforeAll, describe, expect, it } from 'vitest'

import { seedAuthors } from '@/seed/authors'

import { createBrand, createCategoryPair, createProduct, Tracker, uid } from './helpers/fixtures'
import { getTestPayload } from './helpers/getTestPayload'

// Regressões apontadas pela revisão final da Fase 1B
const payloadPromise = getTestPayload()
let tracker: Tracker

beforeAll(async () => seedAuthors(await payloadPromise))
afterAll(async () => {
  const payload = await payloadPromise
  await payload.delete({ collection: 'redirects', where: { or: [{ from: { like: '-vs-' } }, { to: { like: '-vs-' } }] } }).catch(() => undefined)
  await tracker?.cleanup()
})

const PUBLISH = {
  summary: 'Um guia direto para escolher bem: o que observar, quanto pagar e quais armadilhas evitar na compra.',
  sources: [{ title: 'Fonte oficial', url: 'https://www.exemplo.com.br' }],
  reviewedAt: '2026-10-04T12:00:00.000Z',
}

async function catalog(productCount: number) {
  const payload = await payloadPromise
  tracker ??= new Tracker(payload)
  const { subcategory } = await createCategoryPair(payload, tracker)
  const brand = await createBrand(payload, tracker)
  const products = []
  for (let i = 0; i < productCount; i++) {
    products.push(await createProduct(payload, tracker, { subcategoryId: subcategory.id, brandId: brand.id }))
  }
  return { payload, subcategory, products }
}

async function content(data: Record<string, unknown>) {
  const payload = await payloadPromise
  return tracker.add(
    'contents',
    await payload.create({ collection: 'contents', data: { title: `C ${uid()}`, type: 'guia', status: 'rascunho', ...data } as never }),
  )
}

describe('Correções após a revisão da 1B', () => {
  it('agendado com a data já passada continua editável e não trava a exclusão de produto', async () => {
    const { payload, subcategory, products } = await catalog(1)
    const future = new Date(Date.now() + 86_400_000).toISOString()
    const doc = await content({
      primarySubcategory: subcategory.id,
      status: 'agendado',
      publishAt: future,
      body: undefined,
      ...PUBLISH,
    })
    // Simula a data chegando
    await payload.update({
      collection: 'contents',
      id: doc.id,
      data: { publishAt: new Date(Date.now() - 60_000).toISOString() },
      context: { skipPublicationCheck: true },
    })
    const edited = await payload.update({ collection: 'contents', id: doc.id, data: { title: 'Título corrigido' } })
    expect(edited.title).toBe('Título corrigido')

    await payload.update({
      collection: 'contents',
      id: doc.id,
      data: { relatedSubcategories: [subcategory.id], picks: [], alsoConsidered: [{ product: products[0].id, reason: 'x' }] },
    })
    await payload.delete({ collection: 'products', id: products[0].id })
    const after = await payload.findByID({ collection: 'contents', id: doc.id })
    expect(after.alsoConsidered).toEqual([])
  })

  it('apagar produto que tornaria um comparativo duplicado manda o conteúdo para revisão', async () => {
    const { payload, products } = await catalog(3)
    const [p1, p2, p3] = products
    const x = await content({ type: 'comparativo', comparedProducts: [p1.id, p2.id, p3.id], status: 'publicado', ...PUBLISH })
    await content({ type: 'comparativo', comparedProducts: [p1.id, p2.id] })
    await payload.delete({ collection: 'products', id: p3.id })
    const after = await payload.findByID({ collection: 'contents', id: x.id })
    expect(after.status).toBe('em_revisao')
    expect(after.productSetKey ?? null).toBeNull()
  })

  it('Melhores publicado que perde uma escolha vai para revisão', async () => {
    const { payload, subcategory, products } = await catalog(3)
    const doc = await content({
      type: 'melhores',
      primarySubcategory: subcategory.id,
      picks: products.map((p, i) => ({ product: p.id, profileLabel: `P${i}`, position: i + 1 })),
      status: 'publicado',
      ...PUBLISH,
    })
    await payload.delete({ collection: 'products', id: products[2].id })
    const after = await payload.findByID({ collection: 'contents', id: doc.id })
    expect(after.status).toBe('em_revisao')
    expect(after.picks).toHaveLength(2)
  })

  it('comparativo acompanha a mudança de slug de um produto', async () => {
    const { payload, products } = await catalog(2)
    const [a, b] = products
    const doc = await content({ type: 'comparativo', comparedProducts: [a.id, b.id], status: 'publicado', ...PUBLISH })
    const newSlug = `zz-renomeado-${uid()}`
    await payload.update({ collection: 'products', id: a.id, data: { slug: newSlug } })
    const after = await payload.findByID({ collection: 'contents', id: doc.id })
    expect(after.slug).toBe([b.slug, newSlug].sort().join('-vs-'))
    const { docs } = await payload.find({ collection: 'redirects', where: { from: { equals: `/comparar/${doc.slug}/` } } })
    expect(docs[0]?.to).toBe(`/comparar/${after.slug}/`)
  })

  it('o e-mail de contato não aparece para o público', async () => {
    const payload = await payloadPromise
    await payload.updateGlobal({ slug: 'site-settings', data: { contactEmail: 'contato@decicompra.com.br' } })
    const publicSettings = await payload.findGlobal({ slug: 'site-settings', overrideAccess: false })
    expect(publicSettings.contactEmail).toBeUndefined()
  })
})
