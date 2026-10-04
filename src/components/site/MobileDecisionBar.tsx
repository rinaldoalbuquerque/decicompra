import { formatScore, type VariantOffers } from '@/content/view-models'

// Barra fixa no rodapé do celular (spec §6.4): nota, faixa e atalho para "Onde comprar"
export function MobileDecisionBar({ score, variant }: { score: number | null; variant: VariantOffers | null }) {
  if (!variant || variant.offers.length === 0) return null
  const values = variant.priceText && !variant.stale ? variant.priceText.split(' · ')[0] : null
  return (
    <div className="superficie-escura fixed inset-x-0 bottom-0 z-30 flex items-center justify-between gap-3 bg-azul-profundo px-4 py-3 text-branco shadow-[0_-4px_12px_rgba(0,0,0,0.15)] lg:hidden">
      <p className="text-sm">
        {formatScore(score) ? <strong className="mr-2 rounded bg-verde-texto px-1.5 py-0.5">{formatScore(score)}</strong> : null}
        {values}
      </p>
      <a href="#onde-comprar" className="rounded-lg bg-azul-eletrico px-4 py-2 text-sm font-semibold">
        Ver lojas
      </a>
    </div>
  )
}
