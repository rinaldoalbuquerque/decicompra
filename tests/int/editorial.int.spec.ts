import { afterAll, beforeAll, describe, expect, it } from 'vitest'

import { EDITORIAL_PACKS, seedEditorialPack } from '@/seed/editorial'
import { seedTaxonomy } from '@/seed/taxonomy'

import { getTestPayload } from './helpers/getTestPayload'

const pack = EDITORIAL_PACKS['air-fryers']
const payloadPromise = getTestPayload()
const COMPARISON = 'mondial-grand-family-afn-50-bi-vs-philips-walita-serie-2000-xl-na230'
let previousTemplate: unknown

async function cleanup() {
  const payload = await payloadPromise
  const contentSlugs = [...pack.contents.map((content) => content.slug).filter(Boolean), COMPARISON, 'mondial-nome-antigo-vs-philips-walita-serie-2000-xl-na230'] as string[]
  await payload.delete({ collection: 'contents', where: { slug: { in: contentSlugs } } })
  await payload.delete({ collection: 'products', where: { slug: { in: [...pack.products.map((product) => product.slug), 'mondial-nome-antigo'] } } })
}

beforeAll(async () => {
  const payload = await payloadPromise
  await seedTaxonomy(payload)
  await cleanup()
  const { docs } = await payload.find({ collection: 'categories', where: { slug: { equals: pack.subcategorySlug } }, limit: 1 })
  previousTemplate = docs[0].specTemplate
})

afterAll(async () => {
  const payload = await payloadPromise
  await cleanup()
  const { docs } = await payload.find({ collection: 'categories', where: { slug: { equals: pack.subcategorySlug } }, limit: 1 })
  await payload.update({ collection: 'categories', id: docs[0].id, data: { specTemplate: previousTemplate as never } })
})

describe('Pacote editorial: air fryers', () => {
  it('cria produtos (rascunho) e conteúdos (em revisão) e não repete na segunda vez', async () => {
    const payload = await payloadPromise
    const first = await seedEditorialPack(payload, pack)
    expect(first.created).toEqual(expect.arrayContaining([...pack.products.map((product) => `produto:${product.slug}`), `conteudo:${COMPARISON}`]))
    const second = await seedEditorialPack(payload, pack)
    expect(second.created).toEqual([])
  })

  it('produtos com variantes, especificações e nota calculada, nada público', async () => {
    const payload = await payloadPromise
    const { docs } = await payload.find({ collection: 'products', where: { slug: { equals: 'philips-walita-serie-3000-xl-na341' } }, limit: 1, depth: 1 })
    const product = docs[0]
    expect(product.status).toBe('rascunho')
    expect(product.finalScore).toBeCloseTo(8.6, 1)
    expect(product.specs?.find((row) => row.key === 'capacidade_total')?.value).toBe('7.2')
    expect(typeof product.brand === 'object' && product.brand?.name).toBe('Philips Walita')
    const variants = await payload.find({ collection: 'variants', where: { product: { equals: product.id } }, sort: 'createdAt' })
    expect(variants.docs.map((variant) => variant.label)).toEqual(['127 V', '220 V'])
    expect(variants.docs.find((variant) => variant.label === '220 V')?.specs?.find((row) => row.key === 'potencia')?.value).toBe('2000')
    expect(variants.docs.find((variant) => variant.isReference)?.label).toBe('127 V')

    const visible = await payload.find({ collection: 'products', where: { slug: { in: pack.products.map((p) => p.slug) } }, overrideAccess: false })
    expect(visible.totalDocs).toBe(0)
  })

  it('conteúdos em revisão, com produtos ligados pelo slug', async () => {
    const payload = await payloadPromise
    const melhores = (await payload.find({ collection: 'contents', where: { slug: { equals: 'melhores-air-fryers' } }, limit: 1, depth: 0 })).docs[0]
    expect(melhores.status).toBe('em_revisao')
    expect(melhores.picks).toHaveLength(4)
    expect(melhores.referencedProducts).toHaveLength(4)

    const comparison = (await payload.find({ collection: 'contents', where: { slug: { equals: COMPARISON } }, limit: 1, depth: 0 })).docs[0]
    expect(comparison.comparedProducts).toHaveLength(2)

    const guide = (await payload.find({ collection: 'contents', where: { slug: { equals: 'como-escolher-air-fryer' } }, limit: 1, depth: 0 })).docs[0]
    const findBlock = (node: unknown): { products?: unknown[] } | null => {
      if (!node || typeof node !== 'object') return null
      const fields = (node as { fields?: { blockType?: string; products?: unknown[] } }).fields
      if (fields?.blockType === 'comparisonTable') return fields
      for (const child of (node as { children?: unknown[]; root?: unknown }).children ?? [(node as { root?: unknown }).root]) {
        const found = findBlock(child)
        if (found) return found
      }
      return null
    }
    expect(findBlock(guide.body)?.products).toHaveLength(4)
    expect(JSON.stringify(guide.body)).not.toContain('productSlugs')
  })

  it('não sobrescreve um produto que já existe (edições do responsável ficam)', async () => {
    const payload = await payloadPromise
    const { docs } = await payload.find({ collection: 'products', where: { slug: { equals: 'britania-bfr50' } }, limit: 1 })
    await payload.update({ collection: 'products', id: docs[0].id, data: { verdict: 'Texto editado pelo responsável, que não pode ser apagado por um novo carregamento do pacote.' } })
    await seedEditorialPack(payload, pack)
    const again = await payload.findByID({ collection: 'products', id: docs[0].id })
    expect(again.verdict).toContain('editado pelo responsável')
  })
})

describe('Correção de um pacote já carregado', () => {
  it('atualiza só o que ninguém editou depois do carregamento; renomeia o slug do produto', async () => {
    const payload = await payloadPromise
    const { refreshFromPack } = await import('@/seed/editorial')
    await seedEditorialPack(payload, pack)
    const edited = (await payload.find({ collection: 'products', where: { slug: { equals: 'britania-bfr50' } }, limit: 1 })).docs[0]
    // Simula uma edição do responsável bem depois do carregamento
    await payload.update({
      collection: 'products',
      id: edited.id,
      data: { verdict: 'Editado pelo responsável e que precisa continuar assim depois da correção do pacote.' },
    })
    await payload.db.updateOne({ collection: 'products', id: edited.id, data: { updatedAt: new Date(Date.now() + 10 * 60_000).toISOString() } })

    const renamed = (await payload.find({ collection: 'products', where: { slug: { equals: 'mondial-grand-family-afn-50-bi' } }, limit: 1 })).docs[0]
    await payload.update({ collection: 'products', id: renamed.id, data: { slug: 'mondial-nome-antigo' } })
    // Rascunho carregado horas antes e nunca editado: criação e última gravação antigas
    const hoursAgo = new Date(Date.now() - 3 * 60 * 60_000).toISOString()
    await payload.db.updateOne({ collection: 'products', id: renamed.id, data: { createdAt: hoursAgo, updatedAt: hoursAgo } })

    const fixedPack = {
      ...pack,
      products: pack.products.map((product) =>
        product.slug === 'britania-bfr50' || product.slug === 'mondial-grand-family-afn-50-bi' ? { ...product, recommendedFor: 'Texto corrigido pelo pacote.' } : product,
      ),
    }
    const report = await refreshFromPack(payload, fixedPack, {
      products: ['britania-bfr50', 'mondial-grand-family-afn-50-bi'],
      renamedProducts: { 'mondial-nome-antigo': 'mondial-grand-family-afn-50-bi' },
    })
    expect(report.updated).toContain('produto:mondial-grand-family-afn-50-bi')
    expect(report.skipped).toContain('produto:britania-bfr50 (editado depois do carregamento)')

    const after = await payload.findByID({ collection: 'products', id: renamed.id })
    expect(after.slug).toBe('mondial-grand-family-afn-50-bi')
    expect(after.recommendedFor).toBe('Texto corrigido pelo pacote.')
    const untouched = await payload.findByID({ collection: 'products', id: edited.id })
    expect(untouched.verdict).toContain('Editado pelo responsável')
  })
})
