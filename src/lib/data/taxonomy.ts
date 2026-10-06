import type { Criterion } from '@/catalog/score'
import { relId } from '@/lib/relations'
import { SLUG_PATTERN } from '@/lib/slug'

import { cachedList } from './cache'
import { getSitePayload } from './payload'

const PUBLIC = { overrideAccess: false } as const

export type CategoryInfo = { id: number; slug: string; name: string; description: string | null; icon: string | null }
export type SubcategoryInfo = CategoryInfo & { criteria: Criterion[]; parent: CategoryInfo }

const toInfo = (doc: { id: number; slug?: string | null; name: string; description?: string | null; icon?: string | null }): CategoryInfo => ({
  id: doc.id,
  slug: doc.slug ?? '',
  name: doc.name,
  description: doc.description ?? null,
  icon: doc.icon ?? null,
})

// Categoria de 1º nível ativa
export const getCategory = cachedList('categoria', async (slug: string): Promise<CategoryInfo | null> => {
  if (!SLUG_PATTERN.test(slug)) return null
  const payload = await getSitePayload()
  const { docs } = await payload.find({
    collection: 'categories',
    where: { and: [{ slug: { equals: slug } }, { parent: { exists: false } }, { active: { not_equals: false } }] },
    depth: 0,
    limit: 1,
    ...PUBLIC,
  })
  return docs[0] ? toInfo(docs[0]) : null
})

// Subcategoria ativa, só sob a categoria-mãe certa (/{categoria}/{subcategoria}/)
export const getSubcategory = cachedList('subcategoria', async (categorySlug: string, slug: string): Promise<SubcategoryInfo | null> => {
  if (!SLUG_PATTERN.test(slug)) return null
  const category = await getCategory(categorySlug)
  if (!category) return null
  const payload = await getSitePayload()
  const { docs } = await payload.find({
    collection: 'categories',
    where: { and: [{ slug: { equals: slug } }, { parent: { equals: category.id } }, { active: { not_equals: false } }] },
    depth: 0,
    limit: 1,
    ...PUBLIC,
  })
  const doc = docs[0]
  if (!doc || Number(relId(doc.parent)) !== category.id) return null
  return { ...toInfo(doc), criteria: (doc.criteria ?? []) as unknown as Criterion[], parent: category }
})
