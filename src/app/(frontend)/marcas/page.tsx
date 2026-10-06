import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { EmptyState } from '@/components/site/EmptyState'
import { ListingPage } from '@/components/site/ListingPage'
import { Pagination } from '@/components/site/Pagination'
import { pageHref, parsePage } from '@/content/pagination'
import { brandPath } from '@/content/paths'
import { listBrands } from '@/lib/data/lists'
import { pageMetadata } from '@/lib/metadata'

type Props = { searchParams: Promise<{ pagina?: string | string[] }> }

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const page = parsePage((await searchParams).pagina)
  return pageMetadata({
    path: pageHref('/marcas/', page),
    title: page > 1 ? `Marcas — página ${page}` : 'Marcas',
    description: 'Marcas com produtos analisados e comparados pelo DeciCompra.',
  })
}

// Índice de marcas (spec §6.8): só marcas com item público, em ordem alfabética
export default async function BrandsIndexPage({ searchParams }: Props) {
  const page = parsePage((await searchParams).pagina)
  const result = await listBrands({ page })
  if (page > result.pages) notFound()
  return (
    <ListingPage breadcrumbs={[{ label: 'Início', href: '/' }, { label: 'Marcas' }]} title="Marcas" intro="Produtos analisados e comparativos, por fabricante.">
      {result.docs.length === 0 ? (
        <EmptyState title="Ainda não há marcas com produtos analisados" action={{ label: 'Voltar ao início', href: '/' }} />
      ) : (
        <>
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {result.docs.map((brand) => (
              <li key={brand.id}>
                <Link href={brandPath(brand.slug)} className="block rounded-xl border border-slate-200 p-4 font-semibold hover:border-azul-eletrico">
                  {brand.name}
                </Link>
              </li>
            ))}
          </ul>
          <Pagination basePath="/marcas/" page={page} pages={result.pages} />
        </>
      )}
    </ListingPage>
  )
}
