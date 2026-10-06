import Link from 'next/link'

import { breadcrumbLd } from '@/content/structured-data'
import { siteUrl } from '@/lib/site-url'

import { JsonLd } from './JsonLd'

export type Crumb = { label: string; href?: string }

export function Breadcrumbs({ items }: { items: Crumb[] }) {
  return (
    <nav aria-label="Trilha" className="text-sm text-texto-suave">
      <JsonLd data={breadcrumbLd(items, siteUrl())} />
      <ol className="flex flex-wrap items-center gap-1">
        {items.map((item, index) => (
          <li key={`${item.label}-${index}`} className="flex items-center gap-1">
            {index > 0 ? <span aria-hidden="true">›</span> : null}
            {item.href ? (
              <Link href={item.href} className="hover:text-azul-eletrico hover:underline">
                {item.label}
              </Link>
            ) : (
              <span aria-current="page" className="text-texto">
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  )
}
