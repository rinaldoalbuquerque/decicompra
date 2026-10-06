import Link from 'next/link'

import { ProductImage } from '@/components/site/ProductImage'
import type { ImageSet } from '@/content/view-models'
import type { SearchChip } from '@/lib/data/home'

const SHORTCUTS = [
  { icon: '🔎', label: 'Procurando um produto', href: '/categorias/' },
  { icon: '⚖️', label: 'Em dúvida entre modelos', href: '/comparar/' },
  { icon: '💡', label: 'Não sei qual comprar', href: '/melhores/' },
]

// Topo escuro da home (spec §6.1, item 2)
export function Hero({ chips, image }: { chips: SearchChip[]; image: ImageSet | null }) {
  return (
    <section className="superficie-escura bg-azul-profundo text-branco">
      <div className="mx-auto grid max-w-[1280px] items-center gap-10 px-4 py-14 lg:grid-cols-[1.2fr_1fr] lg:px-8 lg:py-20">
        <div>
          <p className="text-sm font-semibold tracking-wide text-blue-200">Análises independentes · Não vendemos produtos</p>
          <h1 className="mt-3 text-4xl font-extrabold lg:text-6xl">
            Compare. Entenda. <span className="text-verde">Decida.</span>
          </h1>
          <p className="mt-4 max-w-xl text-base text-blue-100 lg:text-xl">
            Análises, comparativos e guias completos para você escolher o melhor produto, sem complicação.
          </p>

          <form id="busca-principal" action="/busca/" method="get" role="search" className="mt-8 flex max-w-xl gap-2">
            <input
              type="search"
              name="q"
              aria-label="Buscar"
              placeholder="Qual produto você procura?"
              maxLength={80}
              className="min-w-0 flex-1 rounded-lg px-4 py-3 text-texto"
            />
            <button type="submit" className="rounded-lg bg-verde px-6 py-3 font-semibold text-azul-profundo">
              Buscar
            </button>
          </form>

          {chips.length > 0 ? (
            <ul className="mt-4 flex flex-wrap gap-2" aria-label="Sugestões de busca">
              {chips.map((chip) => (
                <li key={chip.href}>
                  <Link href={chip.href} className="rounded-full border border-white/30 px-3 py-1 text-sm hover:bg-white/10">
                    {chip.label}
                  </Link>
                </li>
              ))}
            </ul>
          ) : null}

          <nav aria-label="Atalhos" className="mt-8">
            <ul className="grid gap-3 sm:grid-cols-3">
              {SHORTCUTS.map((shortcut) => (
                <li key={shortcut.href}>
                  <Link href={shortcut.href} className="flex items-center gap-2 rounded-xl bg-white/10 px-4 py-3 font-semibold hover:bg-white/20">
                    <span aria-hidden="true">{shortcut.icon}</span>
                    {shortcut.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        {image ? (
          <div data-hero-image className="hidden lg:block">
            <ProductImage image={image} sizes="(min-width: 1024px) 520px, 0px" priority />
          </div>
        ) : null}
      </div>
    </section>
  )
}
