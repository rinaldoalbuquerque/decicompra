import { describe, expect, it } from 'vitest'

import { computePriceRange, formatPriceRange, offerPriceErrors, type OfferForPrice } from '@/catalog/price-range'

const now = new Date('2026-10-03T12:00:00.000Z')
const offer = (o: Partial<OfferForPrice>): OfferForPrice => ({
  status: 'active',
  priceMin: 4300,
  priceMax: 4600,
  verifiedAt: '2026-10-01T12:00:00.000Z',
  ...o,
})

describe('computePriceRange', () => {
  it('menor mínimo e maior máximo entre as ofertas ativas, com a verificação mais antiga', () => {
    expect(
      computePriceRange(
        [
          offer({}),
          offer({ priceMin: 4500, priceMax: 5100, verifiedAt: '2026-09-20T12:00:00.000Z' }),
          offer({ status: 'unavailable', priceMin: 100, priceMax: 9999 }),
        ],
        now,
      ),
    ).toEqual({ kind: 'range', min: 4300, max: 5100, verifiedAt: new Date('2026-09-20T12:00:00.000Z') })
  })

  it('sem oferta ativa = indisponível', () => {
    expect(computePriceRange([offer({ status: 'unavailable' })], now)).toEqual({ kind: 'unavailable' })
    expect(computePriceRange([], now)).toEqual({ kind: 'unavailable' })
  })

  it('oculta a faixa quando a verificação mais antiga passou de 60 dias', () => {
    expect(computePriceRange([offer({ verifiedAt: '2026-08-04T11:00:00.000Z' })], now)).toEqual({ kind: 'stale' })
    expect(computePriceRange([offer({ verifiedAt: '2026-08-04T13:00:00.000Z' })], now).kind).toBe('range')
  })
})

describe('formatPriceRange', () => {
  const plain = (s: string | null) => s?.replace(/ /g, ' ')

  it('formata como na spec', () => {
    expect(plain(formatPriceRange({ kind: 'range', min: 4300, max: 5100, verifiedAt: new Date('2026-10-03T12:00:00.000Z') }))).toBe(
      'R$ 4.300 – R$ 5.100 · verificado em 03/10/2026',
    )
  })

  it('mínimo igual ao máximo mostra um valor só', () => {
    expect(plain(formatPriceRange({ kind: 'range', min: 999, max: 999, verifiedAt: new Date('2026-10-03T12:00:00.000Z') }))).toBe(
      'R$ 999 · verificado em 03/10/2026',
    )
  })

  it('indisponível e desatualizada', () => {
    expect(formatPriceRange({ kind: 'unavailable' })).toBe('Indisponível no momento')
    expect(formatPriceRange({ kind: 'stale' })).toBeNull()
  })
})

describe('offerPriceErrors', () => {
  it('valida mínimo positivo e máximo ≥ mínimo', () => {
    expect(offerPriceErrors(100, 200)).toEqual([])
    expect(offerPriceErrors(0, 200)).toEqual(['O preço mínimo precisa ser maior que zero.'])
    expect(offerPriceErrors(300, 200)).toEqual(['O preço máximo não pode ser menor que o mínimo.'])
  })
})
