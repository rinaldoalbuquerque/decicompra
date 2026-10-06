import type { ReactNode } from 'react'

import { PAGE_CONTAINER } from './blocks'
import { Breadcrumbs, type Crumb } from './Breadcrumbs'

// Moldura das páginas de lista: trilha, título, introdução, filtro e conteúdo
export function ListingPage({
  breadcrumbs,
  title,
  intro,
  filter,
  children,
}: {
  breadcrumbs: Crumb[]
  title: string
  intro?: ReactNode
  filter?: ReactNode
  children: ReactNode
}) {
  return (
    <div className={PAGE_CONTAINER}>
      <Breadcrumbs items={breadcrumbs} />
      <h1 className="mt-4 text-3xl font-extrabold lg:text-4xl">{title}</h1>
      {intro ? <div className="mt-3 max-w-3xl text-lg text-texto-suave">{intro}</div> : null}
      {filter}
      <div className="mt-8">{children}</div>
    </div>
  )
}
