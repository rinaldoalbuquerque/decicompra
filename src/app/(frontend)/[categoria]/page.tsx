import type { Metadata } from 'next'
import Link from 'next/link'

import { Section } from '@/components/site/blocks'
import { ContentGrid } from '@/components/site/ContentCard'
import { EmptyState } from '@/components/site/EmptyState'
import { ListingPage } from '@/components/site/ListingPage'
import { SubcategoryCard } from '@/components/site/SubcategoryCard'
import { pageHref } from '@/content/pagination'
import { categoryPath, CONTENT_PREFIX } from '@/content/paths'
import { getPublicTaxonomy, listContents } from '@/lib/data/lists'
import { notFoundOrRedirect } from '@/lib/data/redirects'
import { getCategory } from '@/lib/data/taxonomy'

export const revalidate = 3600
export const dynamicParams = true

export async function generateStaticParams() {
  return []
}

type Params = { params: Promise<{ categoria: string }> }

async function load(slug: string) {
  const category = await getCategory(slug)
  if (!category) return null
  const publicCategory = (await getPublicTaxonomy()).find((item) => item.id === category.id)
  return { category, subcategories: publicCategory?.subcategories ?? [] }
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { categoria } = await params
  const data = await load(categoria)
  if (!data) return {}
  return {
    title: data.category.name,
    description: data.category.description ?? `Análises, comparativos e guias de ${data.category.name}.`,
    // Sem item público: fora do Google (spec §5.5)
    ...(data.subcategories.length === 0 ? { robots: { index: false, follow: true } } : {}),
  }
}

// Categoria (spec §6.2): introdução, subcategorias, destaques e links para os índices
export default async function CategoryPage({ params }: Params) {
  const { categoria } = await params
  const data = await load(categoria)
  if (!data) return notFoundOrRedirect(categoryPath(categoria))
  const { category, subcategories } = data
  const subcategoryIds = subcategories.map((sub) => sub.id)
  const [best, comparisons, guides] = await Promise.all(
    (['melhores', 'comparativo', 'guia'] as const).map((type) => listContents({ type, subcategoryIds, page: 1, perPage: 4 })),
  )
  const highlights = [
    { id: 'melhores', title: 'Melhores', result: best, index: CONTENT_PREFIX.melhores },
    { id: 'comparativos', title: 'Comparativos', result: comparisons, index: CONTENT_PREFIX.comparativo },
    { id: 'guias', title: 'Guias de compra', result: guides, index: CONTENT_PREFIX.guia },
  ]

  return (
    <ListingPage breadcrumbs={[{ label: 'Início', href: '/' }, { label: category.name }]} title={category.name} intro={category.description}>
      {subcategories.length === 0 ? (
        <EmptyState title={`Ainda estamos preparando as análises de ${category.name}`} action={{ label: 'Ver todas as categorias', href: '/categorias/' }} />
      ) : (
        <>
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {subcategories.map((sub) => (
              <li key={sub.id}>
                <SubcategoryCard href={categoryPath(sub.slug, category.slug)} name={sub.name} description={sub.description} icon={sub.icon} />
              </li>
            ))}
          </ul>
          {highlights.map((block) =>
            block.result.docs.length > 0 ? (
              <Section key={block.id} id={block.id} title={block.title}>
                <ContentGrid items={block.result.docs} />
                <p className="mt-4">
                  <Link href={pageHref(block.index, 1, { categoria: category.slug })} className="font-semibold text-azul-eletrico hover:underline">
                    Ver todos ({block.title}) →
                  </Link>
                </p>
              </Section>
            ) : null,
          )}
        </>
      )}
    </ListingPage>
  )
}
