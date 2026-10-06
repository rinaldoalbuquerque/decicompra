import type { VariantOffers } from '@/content/view-models'

// Faixa de preço (spec §5.2): verificada, desatualizada (só botões) ou indisponível
export function PriceRange({ variant }: { variant: VariantOffers }) {
  if (variant.unavailable) return <p className="font-semibold text-texto-suave">Indisponível no momento</p>
  if (variant.stale || !variant.valuesText) return <p className="text-sm text-texto-suave">Veja o preço atual na loja.</p>
  return (
    <p>
      <span className="text-lg font-bold text-texto">{variant.valuesText}</span>
      {variant.verifiedText ? <span className="block text-xs text-texto-suave">{variant.verifiedText}</span> : null}
    </p>
  )
}
