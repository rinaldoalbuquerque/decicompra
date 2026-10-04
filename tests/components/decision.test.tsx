import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { DecisionBox } from '@/components/site/DecisionBox'
import { MobileDecisionBar } from '@/components/site/MobileDecisionBar'
import type { VariantOffers } from '@/content/view-models'

const variants: VariantOffers[] = [
  { variantId: 1, label: '55"', priceText: 'R$ 4.300 – R$ 4.600 · verificado em 01/10/2026', stale: false, unavailable: false, offers: [{ id: 10, storeId: 1, storeName: 'Loja A', href: '/ir/10' }] },
  { variantId: 2, label: '65"', priceText: 'Indisponível no momento', stale: false, unavailable: true, offers: [] },
]

describe('DecisionBox', () => {
  it('"Onde comprar" com uma seção por variante; a de referência aberta', () => {
    const { container } = render(<DecisionBox variants={variants} referenceVariantId={1} />)
    expect(screen.getByRole('heading', { name: 'Onde comprar' })).toBeDefined()
    expect(container.querySelector('#onde-comprar')).not.toBeNull()
    const sections = container.querySelectorAll('details')
    expect(sections).toHaveLength(2)
    expect(sections[0].hasAttribute('open')).toBe(true)
    expect(sections[1].hasAttribute('open')).toBe(false)
    expect(screen.getByText('Indisponível no momento')).toBeDefined()
  })

  it('variante única não precisa de seletor', () => {
    const { container } = render(<DecisionBox variants={[variants[0]]} referenceVariantId={1} />)
    expect(container.querySelectorAll('details')).toHaveLength(0)
    expect(screen.getByRole('link', { name: 'Ver na Loja A' })).toBeDefined()
  })
})

describe('MobileDecisionBar', () => {
  it('barra fixa com nota, preço e atalho para as lojas', () => {
    render(<MobileDecisionBar score={8.7} variant={variants[0]} />)
    expect(screen.getByRole('link', { name: 'Ver lojas' }).getAttribute('href')).toBe('#onde-comprar')
    expect(screen.getByText(/R\$ 4.300/)).toBeDefined()
  })

  it('sem ofertas não mostra a barra', () => {
    const { container } = render(<MobileDecisionBar score={8.7} variant={variants[1]} />)
    expect(container.innerHTML).toBe('')
  })
})
