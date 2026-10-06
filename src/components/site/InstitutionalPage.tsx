import type { ReactNode } from 'react'

import { formatDate } from '@/lib/format'

import { PAGE_CONTAINER } from './blocks'
import { Breadcrumbs } from './Breadcrumbs'

// Data da última revisão dos textos institucionais (atualize ao mudar um texto)
export const INSTITUTIONAL_UPDATED_AT = '2026-10-06T12:00:00.000Z'

// Moldura das páginas institucionais (spec §6.12): trilha, título, data e texto corrido
export function InstitutionalPage({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className={PAGE_CONTAINER}>
      <article className="mx-auto max-w-[760px]">
        <Breadcrumbs items={[{ label: 'Início', href: '/' }, { label: title }]} />
        <h1 className="mt-4 text-3xl font-extrabold lg:text-4xl">{title}</h1>
        <p className="mt-2 text-sm text-texto-suave">Atualizado em {formatDate(INSTITUTIONAL_UPDATED_AT)}</p>
        <div className="mt-6 leading-relaxed [&_a]:text-azul-eletrico [&_a]:underline [&_h2]:mt-10 [&_h2]:text-2xl [&_h2]:font-bold [&_h3]:mt-6 [&_h3]:text-lg [&_h3]:font-bold [&_li]:mt-1 [&_ol]:mt-3 [&_ol]:list-decimal [&_ol]:pl-6 [&_p]:mt-3 [&_table]:mt-4 [&_table]:w-full [&_table]:text-sm [&_td]:border-t [&_td]:border-slate-200 [&_td]:p-2 [&_th]:p-2 [&_th]:text-left [&_ul]:mt-3 [&_ul]:list-disc [&_ul]:pl-6">
          {children}
        </div>
      </article>
    </div>
  )
}
