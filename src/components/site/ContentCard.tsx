import Link from 'next/link'

import { CONTENT_TYPE_LABEL } from '@/content/paths'
import type { ContentCardData } from '@/lib/data/lists'
import { formatDate } from '@/lib/format'

// Cartão de conteúdo das listas (hubs, índices, home)
export function ContentCard({ item }: { item: ContentCardData }) {
  const date = formatDate(item.reviewedAt ?? item.publishAt)
  return (
    <article className="flex h-full flex-col rounded-xl border border-slate-200 bg-branco p-4 hover:border-azul-eletrico">
      <p className="text-xs font-semibold uppercase tracking-wide text-verde-texto">{CONTENT_TYPE_LABEL[item.type]}</p>
      <h3 className="mt-1 text-lg font-bold">
        <Link href={item.href} className="hover:text-azul-eletrico hover:underline">
          {item.title}
        </Link>
      </h3>
      {item.summary ? <p className="mt-2 line-clamp-3 text-sm text-texto-suave">{item.summary}</p> : null}
      <p className="mt-auto pt-3 text-xs text-texto-suave">
        {[item.subcategoryName, date ? `Revisado em ${date}` : null].filter(Boolean).join(' · ')}
      </p>
    </article>
  )
}

export function ContentGrid({ items }: { items: ContentCardData[] }) {
  return (
    <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((item) => (
        <li key={item.id}>
          <ContentCard item={item} />
        </li>
      ))}
    </ul>
  )
}
