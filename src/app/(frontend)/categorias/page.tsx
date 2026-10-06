import type { Metadata } from 'next'
import Link from 'next/link'

import { EmptyState } from '@/components/site/EmptyState'
import { ListingPage } from '@/components/site/ListingPage'
import { SubcategoryCard } from '@/components/site/SubcategoryCard'
import { categoryPath } from '@/content/paths'
import { getPublicTaxonomy } from '@/lib/data/lists'

export const revalidate = 3600

export const metadata: Metadata = {
  title: 'Categorias',
  description: 'Todas as categorias e subcategorias com análises, comparativos e guias no DeciCompra.',
}

// Índice de categorias (spec §6.8): só o que tem item público (spec §3.1)
export default async function CategoriesIndexPage() {
  const taxonomy = await getPublicTaxonomy()
  return (
    <ListingPage
      breadcrumbs={[{ label: 'Início', href: '/' }, { label: 'Categorias' }]}
      title="Categorias"
      intro="Escolha o tipo de produto para ver as análises, os comparativos e os guias."
    >
      {taxonomy.length === 0 ? (
        <EmptyState title="Ainda estamos preparando as primeiras análises" action={{ label: 'Voltar ao início', href: '/' }} />
      ) : (
        <div className="space-y-10">
          {taxonomy.map((category) => (
            <section key={category.id} aria-labelledby={`categoria-${category.slug}`}>
              <h2 id={`categoria-${category.slug}`} className="mb-4 text-2xl font-bold">
                <Link href={categoryPath(category.slug)} className="hover:text-azul-eletrico hover:underline">
                  {category.name}
                </Link>
              </h2>
              <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {category.subcategories.map((sub) => (
                  <li key={sub.id}>
                    <SubcategoryCard href={categoryPath(sub.slug, category.slug)} name={sub.name} description={sub.description} icon={sub.icon} />
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </ListingPage>
  )
}
