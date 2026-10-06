import { afterAll, beforeAll, describe, expect, it } from 'vitest'

import { getHomeData } from '@/lib/data/home'
import { seedDemo } from '@/seed/demo'

import { Tracker, uid } from './helpers/fixtures'
import { getTestPayload } from './helpers/getTestPayload'
import { getTestUsers } from './helpers/users'

const payloadPromise = getTestPayload()
let tracker: Tracker
let original: Record<string, unknown> | null = null

beforeAll(async () => {
  const payload = await payloadPromise
  tracker = new Tracker(payload)
  await seedDemo(payload)
  original = (await payload.findGlobal({ slug: 'home-page', depth: 0 })) as unknown as Record<string, unknown>
})
afterAll(async () => {
  const payload = await payloadPromise
  if (original) {
    const { searchChips, subcategoryCards, featuredComparisons, featuredBest, featuredGuides, featuredExplainers } = original
    await payload.updateGlobal({
      slug: 'home-page',
      data: { searchChips, subcategoryCards, featuredComparisons, featuredBest, featuredGuides, featuredExplainers } as never,
    })
  }
  await tracker?.cleanup()
})

const idOf = async (collection: 'contents' | 'categories', slug: string) => {
  const payload = await payloadPromise
  return (await payload.find({ collection, where: { slug: { equals: slug } }, limit: 1, depth: 0 })).docs[0].id
}

describe('Dados da home', () => {
  it('o seed de demonstração preenche a home quando ela está vazia', async () => {
    const data = await getHomeData()
    expect(data.best.map((item) => item.slug)).toContain('demo-melhores-tvs')
    expect(data.comparisons.map((item) => item.slug)).toContain('demo-tv-alfa-vs-demo-tv-beta')
    expect(data.subcategories.map((item) => item.slug)).toContain('smart-tvs')
    expect(data.recent.map((item) => item.slug)).toContain('demo-tv-alfa')
    expect(data.recent.map((item) => item.slug)).not.toContain('demo-tv-beta')
  })

  it('descarta conteúdo não público e subcategoria sem conteúdo escolhidos no painel, mantendo a ordem', async () => {
    const payload = await payloadPromise
    const smartTvs = await idOf('categories', 'smart-tvs')
    const soundbars = await idOf('categories', 'soundbars')
    const draft = tracker.add(
      'contents',
      await payload.create({
        collection: 'contents',
        data: { title: `Guia rascunho ${uid()}`, type: 'guia', status: 'rascunho', primarySubcategory: smartTvs } as never,
      }),
    )
    const guide = await idOf('contents', 'demo-guia-como-escolher-tv')
    // O administrador vê rascunhos no painel e pode escolhê-los (ou o conteúdo é despublicado depois)
    const { admin } = await getTestUsers(payload)
    await payload.updateGlobal({
      slug: 'home-page',
      data: { featuredGuides: [draft.id, guide], subcategoryCards: [soundbars, smartTvs] } as never,
      user: admin,
      overrideAccess: false,
    })
    const data = await getHomeData()
    expect(data.guides.map((item) => item.slug)).toEqual(['demo-guia-como-escolher-tv'])
    expect(data.subcategories.map((item) => item.slug)).toEqual(['smart-tvs'])
    expect(data.subcategories[0].href).toBe('/tvs-e-entretenimento/smart-tvs/')
  })
})
