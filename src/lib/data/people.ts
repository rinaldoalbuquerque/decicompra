import { toImageSet, type ImageSet } from '@/content/view-models'
import { SLUG_PATTERN } from '@/lib/slug'

import { cachedList } from './cache'
import { getSitePayload } from './payload'

const PUBLIC = { overrideAccess: false } as const

export type BrandInfo = {
  id: number
  slug: string
  name: string
  description: string | null
  officialSite: string | null
  logo: ImageSet | null
  // Produtos públicos (análise ou ficha): os conteúdos que citam algum deles aparecem na página
  productIds: number[]
}

export type AuthorInfo = { id: number; slug: string; name: string; bio: string | null; image: ImageSet | null }

export const getBrand = cachedList('marca', async (slug: string): Promise<BrandInfo | null> => {
  if (!SLUG_PATTERN.test(slug)) return null
  const payload = await getSitePayload()
  const { docs } = await payload.find({ collection: 'brands', where: { slug: { equals: slug } }, depth: 1, limit: 1, ...PUBLIC })
  const brand = docs[0]
  if (!brand) return null
  const products = await payload.find({
    collection: 'products',
    where: { brand: { equals: brand.id } },
    depth: 0,
    pagination: false,
    select: { slug: true },
    ...PUBLIC,
  })
  return {
    id: brand.id,
    slug: brand.slug ?? slug,
    name: brand.name,
    description: brand.description ?? null,
    officialSite: brand.officialSite ?? null,
    logo: toImageSet(brand.logo),
    productIds: products.docs.map((product) => product.id),
  }
})

export const getAuthor = cachedList('autor', async (slug: string): Promise<AuthorInfo | null> => {
  if (!SLUG_PATTERN.test(slug)) return null
  const payload = await getSitePayload()
  const { docs } = await payload.find({ collection: 'authors', where: { slug: { equals: slug } }, depth: 1, limit: 1, ...PUBLIC })
  const author = docs[0]
  if (!author) return null
  return { id: author.id, slug: author.slug ?? slug, name: author.name, bio: author.bio ?? null, image: toImageSet(author.image) }
})

// Lojas ativas (página "Divulgação de afiliados")
export const getActiveStores = cachedList('lojas-ativas', async (): Promise<{ id: number; name: string; affiliateProgram: string | null }[]> => {
  const payload = await getSitePayload()
  const { docs } = await payload.find({
    collection: 'stores',
    where: { active: { not_equals: false } },
    sort: 'name',
    depth: 0,
    pagination: false,
    select: { name: true, affiliateProgram: true },
    ...PUBLIC,
  })
  return docs.map((doc) => ({ id: doc.id, name: doc.name, affiliateProgram: doc.affiliateProgram ?? null }))
})
