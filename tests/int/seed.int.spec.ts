import { describe, expect, it } from 'vitest'

import { footerColumns } from '@/config/navigation'
import { seedTaxonomy, TAXONOMY } from '@/seed/taxonomy'

import { getTestPayload } from './helpers/getTestPayload'

describe('Seed das categorias', () => {
  it('é idempotente e bate com a spec e com os links do rodapé', async () => {
    const payload = await getTestPayload()
    await seedTaxonomy(payload)
    const second = await seedTaxonomy(payload)
    expect(second.created).toBe(0)

    const anchors = await payload.find({ collection: 'categories', where: { isAnchor: { equals: true } }, limit: 100 })
    const anchorSlugs = anchors.docs.map((d) => d.slug).sort()
    expect(anchorSlugs).toEqual(expect.arrayContaining(['air-fryers', 'ar-condicionado', 'furadeiras-e-parafusadeiras', 'notebooks', 'smart-tvs']))
    for (const doc of anchors.docs.filter((d) => TAXONOMY.some((c) => c.subcategories.some((s) => s.slug === d.slug)))) {
      expect((doc.criteria ?? []).reduce((sum, c) => sum + c.weight, 0)).toBe(100)
    }

    const footerCategoryHrefs = footerColumns.find((c) => c.title === 'Categorias')!.links.map((l) => l.href)
    expect(TAXONOMY.map((c) => `/${c.slug}/`)).toEqual(footerCategoryHrefs)
  })
})
