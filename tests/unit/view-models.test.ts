import { describe, expect, it } from 'vitest'

import { formatScore, toImageSet, toProductSummary, variantOffers, type OfferDoc } from '@/content/view-models'

const now = new Date('2026-10-04T12:00:00.000Z')
const storeA = { id: 1, name: 'Loja A', active: true }
const storeB = { id: 2, name: 'Loja B', active: false }

const offer = (o: Partial<OfferDoc>): OfferDoc => ({
  id: 10,
  variant: 100,
  store: storeA,
  status: 'active',
  priceMin: 4300,
  priceMax: 4600,
  verifiedAt: '2026-10-01T12:00:00.000Z',
  ...o,
})

const plain = (s: string | null) => s?.replace(/ /g, ' ') ?? null

describe('formatScore', () => {
  it('uma casa decimal com vírgula', () => {
    expect(formatScore(8.7)).toBe('8,7')
    expect(formatScore(9)).toBe('9,0')
    expect(formatScore(null)).toBeNull()
  })
})

describe('toImageSet', () => {
  it('monta srcset com as versões WebP', () => {
    expect(
      toImageSet({
        url: 'https://img/media/tv.png',
        alt: 'TV',
        width: 1600,
        height: 1000,
        sizes: {
          thumb: { url: 'https://img/media/tv-320x200.webp', width: 320 },
          card: { url: 'https://img/media/tv-640x400.webp', width: 640 },
          large: { url: 'https://img/media/tv-1280x800.webp', width: 1280 },
        },
      }),
    ).toEqual({
      src: 'https://img/media/tv-640x400.webp',
      srcSet: 'https://img/media/tv-320x200.webp 320w, https://img/media/tv-640x400.webp 640w, https://img/media/tv-1280x800.webp 1280w',
      alt: 'TV',
      width: 1600,
      height: 1000,
    })
  })

  it('sem imagem ou só com o id devolve null; sem versões usa o original', () => {
    expect(toImageSet(null)).toBeNull()
    expect(toImageSet(5)).toBeNull()
    expect(toImageSet({ url: '/a.png', alt: 'A', width: 10, height: 5 })).toEqual({ src: '/a.png', srcSet: '', alt: 'A', width: 10, height: 5 })
  })
})

describe('variantOffers', () => {
  it('faixa e botões só de ofertas ativas de lojas ativas', () => {
    const result = variantOffers(
      { id: 100, label: '55"' },
      [offer({}), offer({ id: 11, store: storeB, priceMin: 100 }), offer({ id: 12, status: 'unavailable', priceMin: 50 }), offer({ id: 13, variant: 200 })],
      now,
    )
    expect(plain(result.priceText)).toBe('R$ 4.300 – R$ 4.600 · verificado em 01/10/2026')
    expect(result.offers).toEqual([{ id: 10, storeName: 'Loja A', href: '/ir/10' }])
    expect(result.stale).toBe(false)
    expect(result.unavailable).toBe(false)
  })

  it('desatualizada esconde a faixa e mantém os botões', () => {
    const result = variantOffers({ id: 100, label: '55"' }, [offer({ verifiedAt: '2026-07-01T12:00:00.000Z' })], now)
    expect(result.priceText).toBeNull()
    expect(result.stale).toBe(true)
    expect(result.offers).toHaveLength(1)
  })

  it('sem oferta ativa fica indisponível', () => {
    const result = variantOffers({ id: 100, label: '55"' }, [offer({ status: 'unavailable' })], now)
    expect(result.unavailable).toBe(true)
    expect(result.priceText).toBe('Indisponível no momento')
    expect(result.offers).toEqual([])
  })
})

describe('toProductSummary', () => {
  it('usa a variante de referência e a nota com faixa', () => {
    const summary = toProductSummary(
      { id: 1, slug: 'tv', name: 'TV', finalScore: 8.7, brand: { name: 'Marca' }, images: [] },
      [
        { id: 100, label: '55"', isReference: false },
        { id: 200, label: '65"', isReference: true },
      ],
      [offer({ id: 20, variant: 200, priceMin: 6000, priceMax: 6500 })],
      now,
    )
    expect(summary).toMatchObject({ id: 1, slug: 'tv', name: 'TV', brandName: 'Marca', scoreText: '8,7', band: 'Muito bom', image: null })
    expect(summary.reference?.label).toBe('65"')
    expect(summary.reference?.offers.map((o) => o.id)).toEqual([20])
  })

  it('sem nota e sem variantes não quebra', () => {
    const summary = toProductSummary({ id: 2, slug: 'x', name: 'X', finalScore: null, brand: 7, images: null }, [], [], now)
    expect(summary).toMatchObject({ scoreText: null, band: null, brandName: null, reference: null })
  })
})
