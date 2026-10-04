import type { ReactNode } from 'react'

import { Breadcrumbs, type Crumb } from './Breadcrumbs'
import { TransparencyLine } from './TransparencyLine'

// Peças simples compartilhadas pelas páginas de produto e de conteúdo

export function ProsCons({ pros, cons }: { pros: string[]; cons: string[] }) {
  if (pros.length === 0 && cons.length === 0) return null
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div>
        <h3 className="mb-2 text-sm font-bold uppercase tracking-wide text-verde-texto">Pontos positivos</h3>
        <ul className="space-y-1">
          {pros.map((text) => (
            <li key={text} className="flex gap-2">
              <span aria-hidden="true" className="text-verde-texto">✔</span>
              {text}
            </li>
          ))}
        </ul>
      </div>
      <div>
        <h3 className="mb-2 text-sm font-bold uppercase tracking-wide text-negativo">Pontos negativos</h3>
        <ul className="space-y-1">
          {cons.map((text) => (
            <li key={text} className="flex gap-2">
              <span aria-hidden="true" className="text-negativo">✘</span>
              {text}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

export function QuickSummary({ title = 'Resumo rápido', children }: { title?: string; children: ReactNode }) {
  return (
    <section aria-label={title} className="rounded-xl border-2 border-azul-eletrico bg-cinza-claro p-5">
      {children}
    </section>
  )
}

export function SourcesList({ sources }: { sources: { title: string; url: string }[] }) {
  if (sources.length === 0) return null
  return (
    <section aria-labelledby="fontes-titulo" className="mt-10">
      <h2 id="fontes-titulo" className="mb-3 text-xl font-bold">
        Fontes
      </h2>
      <ul className="list-disc space-y-1 pl-5 text-sm text-texto-suave">
        {sources.map((source) => (
          <li key={source.url}>
            <a href={source.url} rel="nofollow noopener" target="_blank" className="underline hover:text-azul-eletrico">
              {source.title}
            </a>
          </li>
        ))}
      </ul>
    </section>
  )
}

export function PageHeader({
  breadcrumbs,
  title,
  reviewedAt,
  authorName,
  withAffiliateNotice,
  children,
}: {
  breadcrumbs: Crumb[]
  title: string
  reviewedAt?: string | null
  authorName?: string | null
  withAffiliateNotice?: boolean
  children?: ReactNode
}) {
  return (
    <header className="space-y-3">
      <Breadcrumbs items={breadcrumbs} />
      <h1 className="text-3xl font-extrabold lg:text-4xl">{title}</h1>
      <TransparencyLine reviewedAt={reviewedAt} authorName={authorName} withAffiliateNotice={withAffiliateNotice} />
      {children}
    </header>
  )
}

export function Section({ id, title, children }: { id?: string; title: string; children: ReactNode }) {
  return (
    <section id={id} aria-labelledby={id ? `${id}-titulo` : undefined} className="mt-10 scroll-mt-24">
      <h2 id={id ? `${id}-titulo` : undefined} className="mb-4 text-2xl font-bold">
        {title}
      </h2>
      {children}
    </section>
  )
}

export const PAGE_CONTAINER = 'mx-auto max-w-[1280px] px-4 py-8 lg:px-8'
