export const STALE_PRICE_DAYS = 60

const DAY_MS = 86_400_000

export type OfferForPrice = {
  status: 'active' | 'unavailable'
  priceMin: number
  priceMax: number
  verifiedAt: string | Date
}

export type PriceRange =
  | { kind: 'range'; min: number; max: number; verifiedAt: Date }
  | { kind: 'stale' }
  | { kind: 'unavailable' }

// Faixa exibida para uma variante (spec §5.2)
export function computePriceRange(offers: OfferForPrice[], now: Date): PriceRange {
  const active = offers.filter((offer) => offer.status === 'active')
  if (active.length === 0) return { kind: 'unavailable' }
  const oldest = new Date(Math.min(...active.map((offer) => new Date(offer.verifiedAt).getTime())))
  if (now.getTime() - oldest.getTime() > STALE_PRICE_DAYS * DAY_MS) return { kind: 'stale' }
  return {
    kind: 'range',
    min: Math.min(...active.map((offer) => offer.priceMin)),
    max: Math.max(...active.map((offer) => offer.priceMax)),
    verifiedAt: oldest,
  }
}

const currency = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
  maximumFractionDigits: 0,
  minimumFractionDigits: 0,
})
const date = new Intl.DateTimeFormat('pt-BR', { timeZone: 'America/Sao_Paulo', day: '2-digit', month: '2-digit', year: 'numeric' })

// Partes da faixa exibida: valores e data de verificação (null se desatualizada ou indisponível)
export function priceRangeParts(range: PriceRange): { values: string; verified: string } | null {
  if (range.kind === 'unavailable' || range.kind === 'stale') return null
  const values =
    range.min === range.max ? currency.format(range.min) : `${currency.format(range.min)} – ${currency.format(range.max)}`
  return { values, verified: `verificado em ${date.format(range.verifiedAt)}` }
}

export function formatPriceRange(range: PriceRange): string | null {
  if (range.kind === 'unavailable') return 'Indisponível no momento'
  const parts = priceRangeParts(range)
  return parts ? `${parts.values} · ${parts.verified}` : null
}

export function offerPriceErrors(min: number, max: number): string[] {
  const errors: string[] = []
  if (!(min > 0)) errors.push('O preço mínimo precisa ser maior que zero.')
  if (max < min) errors.push('O preço máximo não pode ser menor que o mínimo.')
  return errors
}
