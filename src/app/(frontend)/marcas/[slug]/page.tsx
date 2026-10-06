import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { Section } from '@/components/site/blocks'
import { ContentGrid } from '@/components/site/ContentCard'
import { ListingPage } from '@/components/site/ListingPage'
import { Pagination } from '@/components/site/Pagination'
import { ProductGrid } from '@/components/site/ProductGrid'
import { ProductImage } from '@/components/site/ProductImage'
import { pageHref, parsePage } from '@/content/pagination'
import { brandPath } from '@/content/paths'
import { isBrandIndexable } from '@/content/visibility'
import { countBrandPublicItems, listAnalyzedProducts, listContents } from '@/lib/data/lists'
import { getBrand } from '@/lib/data/people'
import { notFoundOrRedirect } from '@/lib/data/redirects'
import { pageMetadata } from '@/lib/metadata'

type Props = { params: Promise<{ slug: string }>; searchParams: Promise<{ pagina?: string | string[] }> }

async function load(props: Props) {
  const [{ slug }, { pagina }] = await Promise.all([props.params, props.searchParams])
  const page = parsePage(pagina)
  const brand = await getBrand(slug)
  if (!brand) return { slug, page, data: null }
  const [products, contents, publicItems] = await Promise.all([
    listAnalyzedProducts({ brandId: brand.id, page }),
    listContents({ productIds: brand.productIds, page: 1, perPage: 12 }),
    countBrandPublicItems(brand.id),
  ])
  return { slug, page, data: { brand, products, contents, publicItems } }
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const { page, data } = await load(props)
  if (!data) return {}
  const { brand, publicItems } = data
  return pageMetadata({
    path: pageHref(brandPath(brand.slug), page),
    title: page > 1 ? `${brand.name} — página ${page}` : brand.name,
    description: brand.description ?? `Produtos da ${brand.name} analisados pelo DeciCompra, com notas, comparativos e onde comprar.`,
    // Menos de 3 itens públicos: fora do Google (spec §5.5)
    noindex: !isBrandIndexable(publicItems),
  })
}

// Marca (spec §6.8): descrição, produtos analisados e conteúdos que a citam
export default async function BrandPage(props: Props) {
  const { slug, page, data } = await load(props)
  if (!data) return notFoundOrRedirect(brandPath(slug))
  const { brand, products, contents } = data
  if (page > products.pages) notFound()
  const path = brandPath(brand.slug)

  return (
    <ListingPage
      breadcrumbs={[{ label: 'Início', href: '/' }, { label: 'Marcas', href: '/marcas/' }, { label: brand.name }]}
      title={brand.name}
      intro={
        page === 1 ? (
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
            {brand.logo ? <ProductImage image={brand.logo} sizes="120px" className="w-[120px] shrink-0" /> : null}
            <div className="space-y-2">
              {brand.description ? <p>{brand.description}</p> : null}
              {brand.officialSite ? (
                <p className="text-base">
                  <a href={brand.officialSite} target="_blank" rel="nofollow noopener" className="text-azul-eletrico underline">
                    Site oficial da {brand.name}
                  </a>
                </p>
              ) : null}
            </div>
          </div>
        ) : null
      }
    >
      {products.docs.length > 0 ? (
        <Section id="produtos" title={page > 1 ? `Produtos analisados — página ${page}` : 'Produtos analisados'}>
          <ProductGrid items={products.docs} />
          <Pagination basePath={path} page={page} pages={products.pages} />
        </Section>
      ) : null}
      {page === 1 && contents.docs.length > 0 ? (
        <Section id="conteudos" title={`Comparativos, listas e guias com a ${brand.name}`}>
          <ContentGrid items={contents.docs} />
        </Section>
      ) : null}
      {products.docs.length === 0 && contents.docs.length === 0 ? (
        <p className="text-texto-suave">Ainda não publicamos análises de produtos desta marca.</p>
      ) : null}
    </ListingPage>
  )
}
