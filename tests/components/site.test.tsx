import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { AdSlot } from '@/components/site/AdSlot'
import { Breadcrumbs } from '@/components/site/Breadcrumbs'
import { FaqList } from '@/components/site/FaqList'
import { PriceRange } from '@/components/site/PriceRange'
import { ProductCard } from '@/components/site/ProductCard'
import { ScoreBadge } from '@/components/site/ScoreBadge'
import { StoreButtons } from '@/components/site/StoreButtons'
import { TransparencyLine } from '@/components/site/TransparencyLine'
import type { ProductSummary, VariantOffers } from '@/content/view-models'
import { formatDate } from '@/lib/format'

const variant = (o: Partial<VariantOffers> = {}): VariantOffers => ({
  variantId: 1,
  label: '55"',
  priceText: 'R$ 4.300 – R$ 4.600 · verificado em 01/10/2026',
  valuesText: 'R$ 4.300 – R$ 4.600',
  verifiedText: 'verificado em 01/10/2026',
  stale: false,
  unavailable: false,
  offers: [
    { id: 10, storeId: 1, storeName: 'Loja A', href: '/ir/10' },
    { id: 11, storeId: 2, storeName: 'Loja B', href: '/ir/11' },
  ],
  ...o,
})

describe('formatDate', () => {
  it('dd/mm/aaaa no fuso de São Paulo', () => {
    expect(formatDate('2026-10-04T02:00:00.000Z')).toBe('03/10/2026')
    expect(formatDate(null)).toBeNull()
  })
})

describe('StoreButtons', () => {
  it('"Ver na {loja}" com /ir/, rel e target de link patrocinado, e o aviso de comissão', () => {
    render(<StoreButtons offers={variant().offers} />)
    const links = screen.getAllByRole('link', { name: /^Ver na Loja/ })
    expect(links.map((a) => a.textContent)).toEqual(['Ver na Loja A', 'Ver na Loja B'])
    expect(links[0].getAttribute('href')).toBe('/ir/10')
    expect(links[0].getAttribute('rel')).toBe('sponsored nofollow noopener')
    expect(links[0].getAttribute('target')).toBe('_blank')
    expect(screen.getByText(/Podemos receber comissão/)).toBeDefined()
    expect(screen.getByRole('link', { name: 'Saiba mais' }).getAttribute('href')).toBe('/divulgacao-de-afiliados/')
  })

  it('preço desatualizado: "Ver preço na {loja}"; sem ofertas: nada', () => {
    const { container, rerender } = render(<StoreButtons offers={variant().offers} stale />)
    expect(screen.getAllByRole('link', { name: /^Ver preço na/ })).toHaveLength(2)
    rerender(<StoreButtons offers={[]} />)
    expect(container.textContent).toBe('')
  })
})

describe('PriceRange e ScoreBadge', () => {
  it('três estados da faixa', () => {
    const { rerender } = render(<PriceRange variant={variant()} />)
    expect(screen.getByText(/R\$ 4.300/)).toBeDefined()
    rerender(<PriceRange variant={variant({ priceText: null, valuesText: null, verifiedText: null, stale: true })} />)
    expect(screen.getByText(/Veja o preço atual na loja/)).toBeDefined()
    rerender(<PriceRange variant={variant({ priceText: 'Indisponível no momento', valuesText: null, verifiedText: null, unavailable: true, offers: [] })} />)
    expect(screen.getByText('Indisponível no momento')).toBeDefined()
  })

  it('a faixa usa os campos separados (valores e verificação), sem cortar o texto completo', () => {
    render(<PriceRange variant={variant({ priceText: 'texto completo qualquer', valuesText: 'R$ 1.000', verifiedText: 'verificado em 02/10/2026' })} />)
    expect(screen.getByText('R$ 1.000')).toBeDefined()
    expect(screen.getByText('verificado em 02/10/2026')).toBeDefined()
  })

  it('nota com vírgula, faixa e rótulo acessível', () => {
    render(<ScoreBadge score={8.7} showBand />)
    const badge = screen.getByLabelText('Nota DeciCompra 8,7 de 10 (Muito bom)')
    expect(badge.textContent).toContain('8,7')
    expect(screen.getByText('Muito bom')).toBeDefined()
  })

  it('sem nota não mostra o selo', () => {
    const { container } = render(<ScoreBadge score={null} />)
    expect(container.textContent).toBe('')
  })
})

describe('Breadcrumbs, TransparencyLine, FaqList, AdSlot', () => {
  it('trilha com o último item sem link', () => {
    render(<Breadcrumbs items={[{ label: 'Início', href: '/' }, { label: 'TVs', href: '/tvs/' }, { label: 'LG C4' }]} />)
    const nav = screen.getByRole('navigation', { name: 'Trilha' })
    expect(within(nav).getAllByRole('link').map((a) => a.textContent)).toEqual(['Início', 'TVs'])
    expect(within(nav).getByText('LG C4').getAttribute('aria-current')).toBe('page')
  })

  it('linha de transparência', () => {
    render(<TransparencyLine reviewedAt="2026-10-04T12:00:00.000Z" authorName="Equipe DeciCompra" withAffiliateNotice />)
    expect(screen.getByText(/Revisado em 04\/10\/2026 · Equipe DeciCompra · Podemos receber comissão/)).toBeDefined()
  })

  it('FAQ com details/summary', () => {
    const { container } = render(<FaqList items={[{ question: 'Tem Wi-Fi?', answer: 'Sim.' }]} />)
    expect(container.querySelector('details summary')?.textContent).toBe('Tem Wi-Fi?')
  })

  it('anúncio desligado não renderiza nada', () => {
    const { container } = render(<AdSlot placement="content" enabled={false} />)
    expect(container.innerHTML).toBe('')
  })
})

describe('ProductCard', () => {
  const summary: ProductSummary = {
    id: 1,
    slug: 'tv-demo',
    name: 'TV Demo',
    brandName: 'Marca',
    finalScore: 8.7,
    scoreText: '8,7',
    band: 'Muito bom',
    image: null,
    reference: variant(),
  }

  it('sem imagem continua mostrando nome, nota, faixa e link para a análise', () => {
    render(<ProductCard summary={summary} />)
    expect(screen.getByRole('link', { name: 'TV Demo' }).getAttribute('href')).toBe('/produtos/tv-demo/')
    expect(screen.getByLabelText(/Nota DeciCompra 8,7/)).toBeDefined()
    expect(screen.getByText(/R\$ 4.300/)).toBeDefined()
  })
})
