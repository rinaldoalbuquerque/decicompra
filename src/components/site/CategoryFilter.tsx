import Link from 'next/link'

import { pageHref } from '@/content/pagination'

const chip = (current: boolean) =>
  `rounded-full border px-3 py-1 text-sm ${current ? 'border-azul-profundo bg-azul-profundo text-branco' : 'border-slate-200 hover:border-azul-eletrico'}`

// Filtro dos índices por categoria (?categoria=slug), só com links
export function CategoryFilter({
  basePath,
  categories,
  active,
}: {
  basePath: string
  categories: { slug: string; name: string }[]
  active?: string | null
}) {
  if (categories.length === 0) return null
  return (
    <nav aria-label="Filtrar por categoria" className="mt-6">
      <ul className="flex flex-wrap gap-2">
        <li>
          <Link href={basePath} aria-current={!active ? 'page' : undefined} className={chip(!active)}>
            Todas
          </Link>
        </li>
        {categories.map((category) => (
          <li key={category.slug}>
            <Link
              href={pageHref(basePath, 1, { categoria: category.slug })}
              aria-current={active === category.slug ? 'page' : undefined}
              className={chip(active === category.slug)}
            >
              {category.name}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  )
}
