import { describe, expect, it } from 'vitest'

import {
  adminListUrl,
  contentsToReviewWhere,
  productsToReviewWhere,
  productsWithoutActiveOfferWhere,
  staleOffersWhere,
  toQueryString,
} from '@/catalog/maintenance'

describe('consultas de manutenção', () => {
  it('ofertas ativas verificadas há mais de 30 dias', () => {
    expect(staleOffersWhere(new Date('2026-10-31T00:00:00.000Z'))).toEqual({
      and: [{ status: { equals: 'active' } }, { verifiedAt: { less_than: '2026-10-01T00:00:00.000Z' } }],
    })
  })

  it('produtos publicados sem oferta ativa', () => {
    expect(productsWithoutActiveOfferWhere()).toEqual({
      and: [{ status: { not_equals: 'rascunho' } }, { hasActiveOffer: { equals: false } }],
    })
  })
})

describe('toQueryString e adminListUrl', () => {
  it('serializa no formato de colchetes que o painel entende', () => {
    const qs = toQueryString({ where: { and: [{ status: { equals: 'active' } }] } })
    expect(decodeURIComponent(qs)).toBe('where[and][0][status][equals]=active')
  })

  it('monta a URL da lista filtrada', () => {
    const url = adminListUrl('products', productsWithoutActiveOfferWhere())
    expect(url.startsWith('/admin/collections/products?')).toBe(true)
    expect(decodeURIComponent(url)).toContain('where[and][1][hasActiveOffer][equals]=false')
  })
})

describe('itens a revisar (spec §5.8)', () => {
  const now = new Date('2026-10-15T12:00:00.000Z')

  it('conteúdos públicos revisados há mais de 6 meses', () => {
    expect(contentsToReviewWhere(now)).toEqual({
      and: [{ status: { in: ['publicado', 'agendado'] } }, { reviewedAt: { less_than: '2026-04-15T12:00:00.000Z' } }],
    })
  })

  it('produtos publicados revisados há mais de 6 meses', () => {
    expect(productsToReviewWhere(now)).toEqual({
      and: [{ status: { not_equals: 'rascunho' } }, { reviewedAt: { less_than: '2026-04-15T12:00:00.000Z' } }],
    })
  })
})
