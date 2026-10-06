import type { Metadata } from 'next'
import Link from 'next/link'

import { PAGE_CONTAINER, Section } from '@/components/site/blocks'
import { ContentGrid } from '@/components/site/ContentCard'
import { SubcategoryCard } from '@/components/site/SubcategoryCard'
import { categoryPath } from '@/content/paths'
import { getHomeData } from '@/lib/data/home'
import { getPublicTaxonomy } from '@/lib/data/lists'

export const metadata: Metadata = { title: 'Página não encontrada' }

// 404 (spec §6.10): mensagem, busca, categorias e conteúdos populares.
// "Populares" = destaques da home (Melhores e comparativos): ainda não há medição de acessos na v1.
export default async function NotFound() {
  const [taxonomy, home] = await Promise.all([getPublicTaxonomy().catch(() => []), getHomeData().catch(() => null)])
  const popular = [...(home?.best ?? []), ...(home?.comparisons ?? [])].slice(0, 6)

  return (
    <div className={PAGE_CONTAINER}>
      <h1 className="text-3xl font-extrabold lg:text-4xl">Não encontramos esta página</h1>
      <p className="mt-3 max-w-2xl text-lg text-texto-suave">O endereço pode ter mudado ou não existir mais. Tente buscar o que você procura:</p>

      <form action="/busca/" method="get" role="search" className="mt-6 flex max-w-2xl gap-2">
        <input
          type="search"
          name="q"
          aria-label="Buscar"
          placeholder="Produto, marca, modelo…"
          maxLength={80}
          className="min-w-0 flex-1 rounded-lg border border-slate-300 px-4 py-3"
        />
        <button type="submit" className="rounded-lg bg-verde px-5 py-3 font-semibold text-azul-profundo">
          Buscar
        </button>
      </form>

      {taxonomy.length > 0 ? (
        <Section id="categorias" title="Categorias">
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {taxonomy.flatMap((category) =>
              category.subcategories.map((sub) => (
                <li key={sub.id}>
                  <SubcategoryCard href={categoryPath(sub.slug, category.slug)} name={sub.name} description={sub.description} icon={sub.icon} />
                </li>
              )),
            )}
          </ul>
        </Section>
      ) : null}

      {popular.length > 0 ? (
        <Section id="populares" title="Conteúdos populares">
          <ContentGrid items={popular} />
        </Section>
      ) : null}

      <p className="mt-10">
        <Link href="/" className="font-semibold text-azul-eletrico hover:underline">
          Voltar ao início
        </Link>
      </p>
    </div>
  )
}
