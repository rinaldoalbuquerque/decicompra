import Link from 'next/link'

import { productPath } from '@/content/paths'
import type { ProductSummary } from '@/content/view-models'

import { PriceRange } from './PriceRange'
import { ProductImage } from './ProductImage'
import { ScoreBadge } from './ScoreBadge'
import { StoreButtons } from './StoreButtons'

// Card de produto (spec §4.9): dados sempre lidos do Produto e das Ofertas
export function ProductCard({ summary, label }: { summary: ProductSummary; label?: string }) {
  return (
    <article className="grid gap-4 rounded-xl border border-slate-200 bg-branco p-4 sm:grid-cols-[160px_1fr]">
      <ProductImage image={summary.image} sizes="160px" />
      <div className="space-y-2">
        {label ? <p className="text-xs font-bold uppercase tracking-wide text-verde-texto">{label}</p> : null}
        <h3 className="text-lg font-bold">
          <Link href={productPath(summary.slug)} className="hover:text-azul-eletrico hover:underline">
            {summary.name}
          </Link>
        </h3>
        {summary.brandName ? <p className="text-sm text-texto-suave">{summary.brandName}</p> : null}
        <ScoreBadge score={summary.finalScore} showBand />
        {summary.reference ? (
          <>
            <PriceRange variant={summary.reference} />
            <StoreButtons offers={summary.reference.offers} stale={summary.reference.stale} compact />
          </>
        ) : null}
      </div>
    </article>
  )
}
