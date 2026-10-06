import type { Metadata } from 'next'
import Link from 'next/link'

import { ListingPage } from '@/components/site/ListingPage'
import { SubcategoryCard } from '@/components/site/SubcategoryCard'
import { categoryPath } from '@/content/paths'
import { normalizeSearchTerm } from '@/content/search-query'
import { SEARCH_GROUPS } from '@/content/search-suggestions'
import { getSearchChips } from '@/lib/data/home'
import { getPublicTaxonomy } from '@/lib/data/lists'
import { searchAll, type SearchGroups } from '@/lib/data/search'

type Props = { searchParams: Promise<{ q?: string | string[] }> }

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const term = normalizeSearchTerm((await searchParams).q)
  // Busca nunca é indexada (spec §5.5)
  return { title: term ? `Busca: ${term}` : 'Busca', robots: { index: false, follow: true } }
}

function SearchForm({ term }: { term: string }) {
  return (
    <form action="/busca/" method="get" role="search" className="flex max-w-2xl gap-2">
      <input
        type="search"
        name="q"
        defaultValue={term}
        aria-label="Buscar"
        placeholder="Produto, marca, modelo…"
        maxLength={80}
        className="min-w-0 flex-1 rounded-lg border border-slate-300 px-4 py-3"
      />
      <button type="submit" className="rounded-lg bg-verde px-5 py-3 font-semibold text-azul-profundo">
        Buscar
      </button>
    </form>
  )
}

// Busca (spec §6.9): resultados agrupados; sem resultados, sugestões e categorias
export default async function SearchPage({ searchParams }: Props) {
  const term = normalizeSearchTerm((await searchParams).q)
  const tooShort = term.length < 2
  const results: SearchGroups | null = tooShort ? null : await searchAll(term)
  const total = results ? SEARCH_GROUPS.reduce((sum, { type }) => sum + results[type].length, 0) : 0
  const showFallback = tooShort || total === 0
  const [chips, taxonomy] = showFallback ? await Promise.all([getSearchChips(), getPublicTaxonomy()]) : [[], []]

  return (
    <ListingPage breadcrumbs={[{ label: 'Início', href: '/' }, { label: 'Busca' }]} title={term ? `Busca: ${term}` : 'Busca'}>
      <SearchForm term={term} />

      {results && total > 0 ? (
        <div className="mt-8 space-y-10">
          {SEARCH_GROUPS.filter(({ type }) => results[type].length > 0).map(({ type, label }) => (
            <section key={type} aria-labelledby={`resultados-${type}`}>
              <h2 id={`resultados-${type}`} className="mb-3 text-xl font-bold">
                {label}
              </h2>
              <ul className="grid gap-2 sm:grid-cols-2">
                {results[type].map((item) => (
                  <li key={item.id}>
                    <Link href={item.href} className="block rounded-lg border border-slate-200 px-4 py-3 font-semibold hover:border-azul-eletrico">
                      {item.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      ) : null}

      {showFallback ? (
        <div className="mt-8 space-y-8">
          <p className="text-lg">{tooShort ? 'Digite pelo menos 2 letras para buscar.' : `Nada encontrado para “${term}”.`}</p>
          {chips.length > 0 ? (
            <div>
              <h2 className="mb-3 text-xl font-bold">Sugestões</h2>
              <ul className="flex flex-wrap gap-2">
                {chips.map((chip) => (
                  <li key={chip.href}>
                    <Link href={chip.href} className="rounded-full border border-slate-200 px-3 py-1 hover:border-azul-eletrico">
                      {chip.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
          {taxonomy.length > 0 ? (
            <div>
              <h2 className="mb-3 text-xl font-bold">Categorias</h2>
              <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {taxonomy.flatMap((category) =>
                  category.subcategories.map((sub) => (
                    <li key={sub.id}>
                      <SubcategoryCard href={categoryPath(sub.slug, category.slug)} name={sub.name} description={sub.description} icon={sub.icon} />
                    </li>
                  )),
                )}
              </ul>
            </div>
          ) : null}
        </div>
      ) : null}
    </ListingPage>
  )
}
