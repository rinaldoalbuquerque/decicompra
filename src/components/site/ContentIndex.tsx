import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { pageHref, parsePage } from '@/content/pagination'
import { CONTENT_PREFIX, type ContentType } from '@/content/paths'
import { getPublicTaxonomy, listContents } from '@/lib/data/lists'

import { CategoryFilter } from './CategoryFilter'
import { ContentGrid } from './ContentCard'
import { EmptyState } from './EmptyState'
import { ListingPage } from './ListingPage'
import { Pagination } from './Pagination'

export type IndexSearchParams = Promise<{ pagina?: string | string[]; categoria?: string | string[] }>

export const INDEX_COPY: Record<ContentType, { title: string; intro: string }> = {
  melhores: { title: 'Melhores', intro: 'Listas com os produtos que mais se destacam em cada categoria, escolhidos por critérios públicos.' },
  comparativo: { title: 'Comparativos', intro: 'Modelos lado a lado, critério por critério, para você decidir entre eles.' },
  guia: { title: 'Guias de compra', intro: 'O que observar antes de comprar, explicado sem complicação.' },
  entenda: { title: 'Entenda', intro: 'Conceitos e tecnologias explicados para você comprar sabendo o que importa.' },
}

async function load(type: ContentType, searchParams: IndexSearchParams) {
  const { pagina, categoria } = await searchParams
  const page = parsePage(pagina)
  const categorySlug = typeof categoria === 'string' ? categoria : null
  const taxonomy = await getPublicTaxonomy()
  const category = categorySlug ? (taxonomy.find((item) => item.slug === categorySlug) ?? null) : null
  // Categoria desconhecida ou sem conteúdo: lista vazia (com "ver todos"), não erro
  const subcategoryIds = categorySlug ? (category?.subcategories.map((sub) => sub.id) ?? []) : undefined
  const result = await listContents({ type, subcategoryIds, page })
  return { page, categorySlug, category, taxonomy, result }
}

export async function contentIndexMetadata(type: ContentType, searchParams: IndexSearchParams): Promise<Metadata> {
  const { page, categorySlug, category } = await load(type, searchParams)
  const copy = INDEX_COPY[type]
  const extra: Record<string, string> = categorySlug ? { categoria: categorySlug } : {}
  return {
    title: [copy.title, category?.name, page > 1 ? `página ${page}` : null].filter(Boolean).join(' — '),
    description: copy.intro,
    ...(page > 1 || categorySlug ? { alternates: { canonical: pageHref(CONTENT_PREFIX[type], page, extra) } } : {}),
  }
}

// Índice de um tipo de conteúdo (spec §6.8): filtro por categoria, grade e paginação
export async function ContentIndex({ type, searchParams }: { type: ContentType; searchParams: IndexSearchParams }) {
  const { page, categorySlug, category, taxonomy, result } = await load(type, searchParams)
  if (page > result.pages) notFound()
  const copy = INDEX_COPY[type]
  const basePath = CONTENT_PREFIX[type]
  return (
    <ListingPage
      breadcrumbs={[{ label: 'Início', href: '/' }, { label: copy.title }]}
      title={copy.title}
      intro={copy.intro}
      filter={<CategoryFilter basePath={basePath} categories={taxonomy.map(({ slug, name }) => ({ slug, name }))} active={categorySlug} />}
    >
      {result.docs.length > 0 ? (
        <>
          <ContentGrid items={result.docs} />
          <Pagination basePath={basePath} page={page} pages={result.pages} extra={categorySlug ? { categoria: categorySlug } : {}} />
        </>
      ) : (
        <EmptyState
          title={category ? `Ainda não há ${copy.title.toLowerCase()} de ${category.name}` : `Ainda não há ${copy.title.toLowerCase()} publicados`}
          action={categorySlug ? { label: 'Ver todos', href: basePath } : { label: 'Voltar ao início', href: '/' }}
        />
      )}
    </ListingPage>
  )
}
