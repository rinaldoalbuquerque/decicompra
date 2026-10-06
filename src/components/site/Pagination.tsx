import Link from 'next/link'

import { pageHref } from '@/content/pagination'

// Números visíveis: primeira, última e a vizinhança da atual (null = reticências)
function visiblePages(page: number, pages: number): (number | null)[] {
  const wanted = new Set([1, pages, page - 1, page, page + 1].filter((n) => n >= 1 && n <= pages))
  const sorted = [...wanted].sort((a, b) => a - b)
  return sorted.flatMap((n, i) => (i > 0 && n - sorted[i - 1] > 1 ? [null, n] : [n]))
}

// Paginação só com links (spec §6.8): ?pagina=N, sem JavaScript
export function Pagination({
  basePath,
  page,
  pages,
  extra = {},
}: {
  basePath: string
  page: number
  pages: number
  extra?: Record<string, string>
}) {
  if (pages <= 1) return null
  const linkClass = 'rounded-lg border border-slate-200 px-3 py-2 hover:border-azul-eletrico hover:text-azul-eletrico'
  return (
    <nav aria-label="Paginação" className="mt-10 flex flex-wrap items-center justify-center gap-2 text-sm">
      {page > 1 ? (
        <Link href={pageHref(basePath, page - 1, extra)} rel="prev" className={linkClass}>
          ← Anterior
        </Link>
      ) : null}
      {visiblePages(page, pages).map((n, i) =>
        n === null ? (
          <span key={`gap-${i}`} aria-hidden="true" className="px-1 text-texto-suave">
            …
          </span>
        ) : (
          <Link
            key={n}
            href={pageHref(basePath, n, extra)}
            aria-label={`Página ${n}`}
            aria-current={n === page ? 'page' : undefined}
            className={n === page ? 'rounded-lg bg-azul-profundo px-3 py-2 font-semibold text-branco' : linkClass}
          >
            {n}
          </Link>
        ),
      )}
      {page < pages ? (
        <Link href={pageHref(basePath, page + 1, extra)} rel="next" className={linkClass}>
          Próxima →
        </Link>
      ) : null}
    </nav>
  )
}
