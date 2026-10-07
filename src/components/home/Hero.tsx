import Link from 'next/link'
import type { ReactNode } from 'react'

import type { ImageSet } from '@/content/view-models'
import type { SearchChip } from '@/lib/data/home'

const EMPTY_GIF = 'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=='

// Ícones de traço (24×24), no estilo dos conjuntos de ícones atuais
const icon = (paths: ReactNode) => (
  <svg aria-hidden="true" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    {paths}
  </svg>
)

const ICONS = {
  // Lupa
  procurando: icon(
    <>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </>,
  ),
  // Balança
  comparar: icon(
    <>
      <path d="M12 3v18" />
      <path d="M7 21h10" />
      <path d="M5 7h14" />
      <path d="m5 7-3 7a3 3 0 0 0 6 0Z" />
      <path d="m19 7-3 7a3 3 0 0 0 6 0Z" />
    </>,
  ),
  // Lâmpada
  ideia: icon(
    <>
      <path d="M9 18h6" />
      <path d="M10 22h4" />
      <path d="M12 2a7 7 0 0 0-4 12.7c.6.5 1 1.2 1 2V17h6v-.3c0-.8.4-1.5 1-2A7 7 0 0 0 12 2Z" />
    </>,
  ),
}

const SHORTCUTS = [
  { icon: ICONS.procurando, label: 'Procurando um produto', href: '/categorias/', id: 'procurando' },
  { icon: ICONS.comparar, label: 'Em dúvida entre modelos', href: '/comparar/', id: 'em-duvida' },
  { icon: ICONS.ideia, label: 'Não sei qual comprar', href: '/melhores/', id: 'nao-sei' },
]

// Topo escuro da home (spec §6.1, item 2). Imagem de fundo opcional (painel → Página inicial), sempre
// coberta por uma camada azul para o texto continuar legível.
export function Hero({ chips, image, background = null }: { chips: SearchChip[]; image: ImageSet | null; background?: ImageSet | null }) {
  return (
    <section className="superficie-escura relative isolate overflow-hidden bg-azul-profundo text-branco">
      {background ? (
        <div data-hero-background aria-hidden="true" className="absolute inset-0 -z-10">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={background.src}
            srcSet={background.srcSet || undefined}
            sizes="100vw"
            alt=""
            fetchPriority="high"
            className="h-full w-full object-cover"
          />
          <div data-hero-overlay className="absolute inset-0 bg-gradient-to-r from-azul-profundo via-azul-profundo/85 to-azul-profundo/55" />
        </div>
      ) : null}
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
              className="min-w-0 flex-1 rounded-lg border border-white/30 bg-azul-profundo/50 px-4 py-3 text-branco shadow-lg backdrop-blur-sm transition placeholder:text-blue-200 hover:border-white/50 focus:bg-azul-profundo/70 focus:outline-none focus-visible:outline-none"
            />
            <button type="submit" className="rounded-lg bg-verde px-6 py-3 font-semibold text-azul-profundo shadow-lg hover:brightness-110">
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
                  <Link
                    href={shortcut.href}
                    data-track="atalho_home"
                    data-track-atalho={shortcut.id}
                    className="group flex h-full items-center gap-3 rounded-xl border border-white/15 bg-white/10 px-4 py-3 font-semibold backdrop-blur-sm transition hover:border-verde/60 hover:bg-white/15"
                  >
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-verde/20 text-verde transition group-hover:bg-verde group-hover:text-azul-profundo">
                      {shortcut.icon}
                    </span>
                    {shortcut.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        {image ? (
          // Só no computador (spec §6.1): no celular o <source> não casa e fica o GIF vazio embutido, sem download
          <div data-hero-image className="hidden lg:block">
            <picture>
              <source media="(min-width: 1024px)" srcSet={image.srcSet || image.src} sizes="520px" />
              <img
                src={EMPTY_GIF}
                alt={image.alt}
                width={image.width || undefined}
                height={image.height || undefined}
                fetchPriority="high"
                className="h-auto w-full rounded-2xl"
              />
            </picture>
          </div>
        ) : null}
      </div>
    </section>
  )
}
