import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { Section } from '@/components/site/blocks'
import { ContentGrid } from '@/components/site/ContentCard'
import { ListingPage } from '@/components/site/ListingPage'
import { Pagination } from '@/components/site/Pagination'
import { ProductImage } from '@/components/site/ProductImage'
import { pageHref, parsePage } from '@/content/pagination'
import { authorPath } from '@/content/paths'
import { listContents } from '@/lib/data/lists'
import { getAuthor } from '@/lib/data/people'
import { notFoundOrRedirect } from '@/lib/data/redirects'

type Props = { params: Promise<{ slug: string }>; searchParams: Promise<{ pagina?: string | string[] }> }

async function load(props: Props) {
  const [{ slug }, { pagina }] = await Promise.all([props.params, props.searchParams])
  const page = parsePage(pagina)
  const author = await getAuthor(slug)
  if (!author) return { slug, page, data: null }
  return { slug, page, data: { author, contents: await listContents({ authorId: author.id, page }) } }
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const { page, data } = await load(props)
  if (!data) return {}
  const { author } = data
  return {
    title: page > 1 ? `${author.name} — página ${page}` : author.name,
    description: author.bio ?? `Conteúdos assinados por ${author.name} no DeciCompra.`,
    ...(page > 1 ? { alternates: { canonical: pageHref(authorPath(author.slug), page) } } : {}),
  }
}

// Autor (spec §6.8): bio e conteúdos assinados
export default async function AuthorPage(props: Props) {
  const { slug, page, data } = await load(props)
  if (!data) return notFoundOrRedirect(authorPath(slug))
  const { author, contents } = data
  if (page > contents.pages) notFound()

  return (
    <ListingPage
      breadcrumbs={[{ label: 'Início', href: '/' }, { label: author.name }]}
      title={author.name}
      intro={
        page === 1 && (author.bio || author.image) ? (
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
            {author.image ? <ProductImage image={author.image} sizes="120px" className="w-[120px] shrink-0" /> : null}
            {author.bio ? <p>{author.bio}</p> : null}
          </div>
        ) : null
      }
    >
      <Section id="conteudos" title={page > 1 ? `Conteúdos — página ${page}` : 'Conteúdos'}>
        {contents.docs.length > 0 ? (
          <ContentGrid items={contents.docs} />
        ) : (
          <p className="text-texto-suave">Nenhum conteúdo publicado ainda.</p>
        )}
        <Pagination basePath={authorPath(author.slug)} page={page} pages={contents.pages} />
      </Section>
    </ListingPage>
  )
}
