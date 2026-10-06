import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { Section } from '@/components/site/blocks'
import { ContentCard, ContentGrid } from '@/components/site/ContentCard'
import { EmptyState } from '@/components/site/EmptyState'
import { ListingPage } from '@/components/site/ListingPage'
import { Pagination } from '@/components/site/Pagination'
import { ProductGrid } from '@/components/site/ProductGrid'
import { pageHref, parsePage } from '@/content/pagination'
import { categoryPath } from '@/content/paths'
import { listAnalyzedProducts, listContents } from '@/lib/data/lists'
import { notFoundOrRedirect } from '@/lib/data/redirects'
import { getSubcategory } from '@/lib/data/taxonomy'

type Props = {
  params: Promise<{ categoria: string; subcategoria: string }>
  searchParams: Promise<{ pagina?: string | string[] }>
}

async function load(props: Props) {
  const [{ categoria, subcategoria }, { pagina }] = await Promise.all([props.params, props.searchParams])
  const page = parsePage(pagina)
  const subcategory = await getSubcategory(categoria, subcategoria)
  if (!subcategory) return { path: categoryPath(subcategoria, categoria), page, data: null }
  const subcategoryIds = [subcategory.id]
  const [products, best, guides, comparisons, explainers] = await Promise.all([
    listAnalyzedProducts({ subcategoryId: subcategory.id, page }),
    listContents({ type: 'melhores', subcategoryIds, page: 1, perPage: 4 }),
    listContents({ type: 'guia', subcategoryIds, page: 1, perPage: 6 }),
    listContents({ type: 'comparativo', subcategoryIds, page: 1, perPage: 6 }),
    listContents({ type: 'entenda', subcategoryIds, page: 1, perPage: 6 }),
  ])
  const path = categoryPath(subcategory.slug, subcategory.parent.slug)
  const empty = products.total + best.total + guides.total + comparisons.total + explainers.total === 0
  return { path, page, data: { subcategory, products, best, guides, comparisons, explainers, empty } }
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const { path, page, data } = await load(props)
  if (!data) return {}
  const { subcategory, empty } = data
  return {
    title: page > 1 ? `${subcategory.name} — página ${page}` : subcategory.name,
    description: subcategory.description ?? `Melhores, comparativos, guias e análises de ${subcategory.name}.`,
    // Sem item público: fora do Google (spec §3.1 e §5.5)
    ...(empty ? { robots: { index: false, follow: true } } : {}),
    ...(page > 1 ? { alternates: { canonical: pageHref(path, page) } } : {}),
  }
}

// Subcategoria, o hub principal (spec §6.3)
export default async function SubcategoryPage(props: Props) {
  const { path, page, data } = await load(props)
  if (!data) return notFoundOrRedirect(path)
  const { subcategory, products, best, guides, comparisons, explainers, empty } = data
  if (page > products.pages) notFound()
  const category = subcategory.parent
  const breadcrumbs = [
    { label: 'Início', href: '/' },
    { label: category.name, href: categoryPath(category.slug) },
    { label: subcategory.name },
  ]

  if (empty) {
    return (
      <ListingPage breadcrumbs={breadcrumbs} title={subcategory.name} intro={subcategory.description}>
        <EmptyState title={`Ainda estamos preparando as análises de ${subcategory.name}`} action={{ label: `Ver ${category.name}`, href: categoryPath(category.slug) }}>
          Enquanto isso, veja as outras categorias.
        </EmptyState>
      </ListingPage>
    )
  }

  const productGrid = (
    <Section id="produtos" title={page > 1 ? `Produtos analisados — página ${page}` : 'Produtos analisados'}>
      <ProductGrid items={products.docs} />
      <Pagination basePath={path} page={page} pages={products.pages} />
    </Section>
  )

  if (page > 1) {
    return (
      <ListingPage breadcrumbs={breadcrumbs} title={subcategory.name}>
        {productGrid}
      </ListingPage>
    )
  }

  const [mainBest, ...otherBest] = best.docs
  return (
    <ListingPage breadcrumbs={breadcrumbs} title={subcategory.name} intro={subcategory.description}>
      {mainBest ? (
        <Section id="melhores" title="Melhores">
          <div className="rounded-2xl border-2 border-verde-texto">
            <ContentCard item={mainBest} />
          </div>
          {otherBest.length > 0 ? (
            <div className="mt-4">
              <ContentGrid items={otherBest} />
            </div>
          ) : null}
        </Section>
      ) : null}
      {guides.docs.length > 0 ? (
        <Section id="guias" title="Guias de compra">
          <ContentGrid items={guides.docs} />
        </Section>
      ) : null}
      {comparisons.docs.length > 0 ? (
        <Section id="comparativos" title="Comparativos">
          <ContentGrid items={comparisons.docs} />
        </Section>
      ) : null}
      {products.docs.length > 0 ? productGrid : null}
      {explainers.docs.length > 0 ? (
        <Section id="entenda" title="Entenda antes de comprar">
          <ContentGrid items={explainers.docs} />
        </Section>
      ) : null}
      {subcategory.criteria.length > 0 ? (
        <Section id="criterios" title={`Como avaliamos ${subcategory.name}`}>
          <p className="mb-3">Cada produto recebe uma nota de 0 a 10 por critério; a Nota DeciCompra é a média ponderada pelos pesos abaixo.</p>
          <ul className="grid gap-2 sm:grid-cols-2">
            {subcategory.criteria.map((criterion) => (
              <li key={criterion.key} className="rounded-lg bg-cinza-claro px-3 py-2">
                {criterion.name} — {criterion.weight}%
              </li>
            ))}
          </ul>
          <p className="mt-3 text-sm">
            Detalhes em{' '}
            <Link href="/como-avaliamos/" className="underline">
              Como avaliamos os produtos
            </Link>
            .
          </p>
        </Section>
      ) : null}
    </ListingPage>
  )
}
