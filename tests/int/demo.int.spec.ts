import { describe, expect, it } from 'vitest'

import { DEMO_SLUGS, seedDemo } from '@/seed/demo'

import { getTestPayload } from './helpers/getTestPayload'

describe('Dados de demonstração', () => {
  it('criam produtos e conteúdos públicos e não duplicam', async () => {
    const payload = await getTestPayload()
    await seedDemo(payload)
    const second = await seedDemo(payload)
    expect(second.created).toBe(false)

    const products = await payload.find({
      collection: 'products',
      where: { slug: { in: DEMO_SLUGS.products } },
      overrideAccess: false,
      limit: 10,
    })
    expect(products.docs.map((p) => p.slug).sort()).toEqual([...DEMO_SLUGS.products].sort())
    const alfa = products.docs.find((p) => p.slug === 'demo-tv-alfa')!
    expect(alfa.status).toBe('analise')
    expect(alfa.hasActiveOffer).toBe(true)

    const contents = await payload.find({ collection: 'contents', where: { slug: { in: DEMO_SLUGS.contents } }, overrideAccess: false })
    expect(contents.totalDocs).toBe(DEMO_SLUGS.contents.length)
  })
})
