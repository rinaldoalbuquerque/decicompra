import type { VariantOffers } from '@/content/view-models'

import { PriceRange } from './PriceRange'
import { StoreButtons } from './StoreButtons'

function VariantBlock({ variant }: { variant: VariantOffers }) {
  return (
    <div className="space-y-3">
      <PriceRange variant={variant} />
      <StoreButtons offers={variant.offers} stale={variant.stale} />
    </div>
  )
}

// Caixa "Onde comprar" (spec §6.4): fixa na lateral no desktop; variantes sem JavaScript (details)
export function DecisionBox({ variants, referenceVariantId }: { variants: VariantOffers[]; referenceVariantId: number | null }) {
  return (
    <section id="onde-comprar" aria-labelledby="onde-comprar-titulo" className="scroll-mt-24 rounded-xl border-2 border-azul-eletrico bg-branco p-5 shadow-sm">
      <h2 id="onde-comprar-titulo" className="mb-3 text-lg font-bold">
        Onde comprar
      </h2>
      {variants.length === 0 ? (
        <p className="text-texto-suave">Indisponível no momento</p>
      ) : variants.length === 1 ? (
        <VariantBlock variant={variants[0]} />
      ) : (
        <div className="space-y-2">
          {variants.map((variant) => (
            <details key={variant.variantId} open={variant.variantId === (referenceVariantId ?? variants[0].variantId)} className="rounded-lg border border-slate-200 px-3 py-2">
              <summary className="cursor-pointer font-semibold">{variant.label}</summary>
              <div className="pt-3">
                <VariantBlock variant={variant} />
              </div>
            </details>
          ))}
        </div>
      )}
    </section>
  )
}
