import { describe, expect, it } from 'vitest'

import { resolveOutbound, type OutboundOffer } from '@/catalog/outbound'

const offer: OutboundOffer = {
  status: 'active',
  affiliateUrl: 'https://www.amazon.com.br/dp/X?tag=decicompra-20',
  store: { active: true },
  product: { slug: 'lg-c4' },
}

describe('resolveOutbound', () => {
  it('oferta ativa de loja ativa vai para a URL de afiliado', () => {
    expect(resolveOutbound(offer)).toBe(offer.affiliateUrl)
  })

  it('oferta indisponível ou loja inativa volta para a página do produto', () => {
    expect(resolveOutbound({ ...offer, status: 'unavailable' })).toBe('/produtos/lg-c4/')
    expect(resolveOutbound({ ...offer, store: { active: false } })).toBe('/produtos/lg-c4/')
  })

  it('sem oferta ou sem produto vai para a home', () => {
    expect(resolveOutbound(null)).toBe('/')
    expect(resolveOutbound({ ...offer, status: 'unavailable', product: null })).toBe('/')
  })
})

describe('resolveOutbound com produto em rascunho', () => {
  it('oferta indisponível de produto em rascunho vai para a home (a página do produto não é pública)', () => {
    expect(resolveOutbound({ ...offer, status: 'unavailable', product: { slug: 'lg-c4', status: 'rascunho' } })).toBe('/')
    expect(resolveOutbound({ ...offer, status: 'unavailable', product: { slug: 'lg-c4', status: 'ficha' } })).toBe('/produtos/lg-c4/')
  })
})
