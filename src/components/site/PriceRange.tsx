import type { VariantOffers } from '@/content/view-models'

// Faixa de preço (spec §5.2): verificada, desatualizada (só botões) ou indisponível
export function PriceRange({ variant }: { variant: VariantOffers }) {
  if (variant.unavailable) return <p className="font-semibold text-texto-suave">Indisponível no momento</p>
  if (variant.stale || !variant.priceText) return <p className="text-sm text-texto-suave">Veja o preço atual na loja.</p>
  const [values, verified] = variant.priceText.split(' · ')
  return (
    <p>
      <span className="text-lg font-bold text-texto">{values}</span>
      {verified ? <span className="block text-xs text-texto-suave">{verified}</span> : null}
    </p>
  )
}
