import { categoryPath } from '@/content/paths'
import { toImageSet, type ImageSet, type ProductSummary } from '@/content/view-models'
import { relId } from '@/lib/relations'

import { getContentCardsByIds, getPublicTaxonomy, listAnalyzedProducts, type ContentCardData } from './lists'
import { getSitePayload } from './payload'

export type SearchChip = { label: string; href: string }

// Sugestões abaixo da busca (global "Página inicial"); em caso de erro, nenhuma
export async function getSearchChips(): Promise<SearchChip[]> {
  try {
    const payload = await getSitePayload()
    const home = await payload.findGlobal({ slug: 'home-page', depth: 0 })
    return (home.searchChips ?? []).filter((chip) => chip.label && chip.href).map((chip) => ({ label: chip.label, href: chip.href }))
  } catch {
    return []
  }
}

export type HomeSubcategory = { id: number; slug: string; name: string; description: string | null; icon: string | null; href: string }

export type HomeData = {
  heroImage: ImageSet | null
  heroBackground: ImageSet | null
  chips: SearchChip[]
  subcategories: HomeSubcategory[]
  categories: { slug: string; name: string; href: string }[]
  comparisons: ContentCardData[]
  best: ContentCardData[]
  guides: ContentCardData[]
  explainers: ContentCardData[]
  recent: ProductSummary[]
}

const idList = (values: unknown[] | null | undefined): number[] =>
  (values ?? []).map(relId).filter((id) => id !== null).map(Number)

// Home (spec §6.1 e §4.11): o que foi escolhido no painel, na ordem do painel, sem o que não é público.
// Subcategorias só com item público (spec §3.1); análises recentes são automáticas.
export async function getHomeData(): Promise<HomeData> {
  const payload = await getSitePayload()
  const home = await payload.findGlobal({ slug: 'home-page', depth: 1 })
  const [taxonomy, comparisons, best, guides, explainers, recent] = await Promise.all([
    getPublicTaxonomy(),
    getContentCardsByIds(idList(home.featuredComparisons)),
    getContentCardsByIds(idList(home.featuredBest)),
    getContentCardsByIds(idList(home.featuredGuides)),
    getContentCardsByIds(idList(home.featuredExplainers)),
    listAnalyzedProducts({ page: 1, perPage: 6 }),
  ])
  const publicSubs = new Map(
    taxonomy.flatMap((category) => category.subcategories.map((sub) => [sub.id, { ...sub, href: categoryPath(sub.slug, category.slug) }] as const)),
  )
  return {
    heroImage: toImageSet(home.heroImage),
    heroBackground: toImageSet(home.heroBackground),
    chips: (home.searchChips ?? []).filter((chip) => chip.label && chip.href).map((chip) => ({ label: chip.label, href: chip.href })),
    subcategories: idList(home.subcategoryCards)
      .map((id) => publicSubs.get(id))
      .filter((sub): sub is NonNullable<typeof sub> => Boolean(sub))
      .map(({ id, slug, name, description, icon, href }) => ({ id, slug, name, description, icon, href })),
    categories: taxonomy.map((category) => ({ slug: category.slug, name: category.name, href: categoryPath(category.slug) })),
    comparisons,
    best,
    guides,
    explainers,
    recent: recent.docs,
  }
}
