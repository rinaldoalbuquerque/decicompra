import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import type { SpecAttribute } from '@/catalog/spec-template'
import { RichContent } from '@/components/site/RichContent'
import type { ProductSummary } from '@/content/view-models'
import { block, heading, lexicalDoc, paragraph } from '@/seed/lexical'

const summary = (id: number, name: string, specs: { key: string; value: string }[]) =>
  ({
    id,
    slug: name.toLowerCase().replace(/\s+/g, '-'),
    name,
    brandName: 'Marca',
    finalScore: 8,
    scoreText: '8,0',
    band: 'Muito bom',
    image: null,
    reference: { variantId: id * 10, label: 'Única', priceText: 'Indisponível no momento', valuesText: null, verifiedText: null, stale: false, unavailable: true, offers: [] },
    product: { id, specs },
  }) as unknown as ProductSummary & { product: { id: number; specs: { key: string; value: string }[] } }

const template: SpecAttribute[] = [
  { key: 'hz', label: 'Taxa de atualização', type: 'number', unit: 'Hz', direction: 'higher', comparable: true },
  { key: 'painel', label: 'Painel', type: 'text', comparable: true },
]

const products = new Map([
  [1, summary(1, 'TV Um', [{ key: 'hz', value: '144' }, { key: 'painel', value: 'OLED' }])],
  [2, summary(2, 'TV Dois', [{ key: 'hz', value: '120' }, { key: 'painel', value: 'QLED' }])],
])

describe('RichContent', () => {
  it('renderiza texto, títulos com id e todos os blocos; produto ausente some', () => {
    const doc = lexicalDoc([
      heading('h2', 'Como escolher'),
      paragraph('Meça a sala.'),
      block({ blockType: 'productCard', product: 1 }),
      block({ blockType: 'productCard', product: 99 }),
      block({ blockType: 'tip', kind: 'aviso', text: 'Cuidado com a voltagem.' }),
      block({ blockType: 'faq', items: [{ question: 'Precisa de suporte?', answer: 'Depende da parede.' }] }),
      block({ blockType: 'sideBySide', leftTitle: 'OLED', leftText: 'Preto perfeito.', rightTitle: 'QLED', rightText: 'Mais brilho.' }),
      block({ blockType: 'simpleTable', header: ['Tamanho', 'Distância'], rows: [{ cells: ['55"', '2 m'] }] }),
      block({ blockType: 'comparisonTable', products: [1, 2], attributes: [] }),
    ])
    const { container } = render(<RichContent data={doc} products={products as never} template={template} />)

    expect(container.querySelector('h2#como-escolher-2')?.textContent).toBe('Como escolher')
    expect(screen.getByText('Meça a sala.')).toBeDefined()
    expect(screen.getAllByRole('link', { name: 'TV Um' }).length).toBeGreaterThan(0)
    expect(screen.queryByText('TV 99')).toBeNull()
    expect(screen.getByText('Cuidado com a voltagem.')).toBeDefined()
    expect(container.querySelector('details summary')?.textContent).toBe('Precisa de suporte?')
    expect(screen.getByText('Preto perfeito.')).toBeDefined()
    expect(screen.getByText('2 m')).toBeDefined()

    const winner = container.querySelector('[data-winner="true"]')
    expect(winner?.textContent).toContain('144')
  })
})

describe('RichContent: botão de oferta', () => {
  it('com loja escolhida mostra só a oferta dela', () => {
    const withOffers = new Map([
      [
        1,
        {
          ...summary(1, 'TV Um', []),
          reference: {
            variantId: 10,
            label: 'Única',
            priceText: 'R$ 1.000 · verificado em 01/10/2026',
            valuesText: 'R$ 1.000',
            verifiedText: 'verificado em 01/10/2026',
            stale: false,
            unavailable: false,
            offers: [
              { id: 5, storeId: 7, storeName: 'Loja Sete', href: '/ir/5' },
              { id: 6, storeId: 8, storeName: 'Loja Oito', href: '/ir/6' },
            ],
          },
        },
      ],
    ])
    render(<RichContent data={lexicalDoc([block({ blockType: 'offerButton', product: 1, store: 8 })])} products={withOffers as never} />)
    expect(screen.getAllByRole('link', { name: /^Ver na/ }).map((a) => a.textContent)).toEqual(['Ver na Loja Oito'])
  })
})

// Parágrafo com um link interno do Lexical (doc populado = público; só o id = não público)
const internalLink = (doc: unknown, label: string) => ({
  type: 'paragraph',
  format: '',
  indent: 0,
  version: 1,
  direction: null,
  textFormat: 0,
  textStyle: '',
  children: [
    {
      type: 'link',
      format: '',
      indent: 0,
      version: 3,
      direction: null,
      fields: { linkType: 'internal', newTab: false, doc },
      children: [{ type: 'text', text: label, format: 0, style: '', mode: 'normal', detail: 0, version: 1 }],
    },
  ],
})

describe('RichContent: links internos', () => {
  it('produto e conteúdo públicos viram o endereço da página', () => {
    render(
      <RichContent
        data={lexicalDoc([
          internalLink({ relationTo: 'products', value: { id: 1, slug: 'tv-um', status: 'analise' } }, 'a TV Um'),
          internalLink({ relationTo: 'contents', value: { id: 9, slug: 'como-escolher', type: 'guia' } }, 'o guia'),
        ])}
        products={new Map()}
      />,
    )
    expect(screen.getByRole('link', { name: 'a TV Um' }).getAttribute('href')).toBe('/produtos/tv-um/')
    expect(screen.getByRole('link', { name: 'o guia' }).getAttribute('href')).toBe('/guias/como-escolher/')
  })

  it('documento não público (só o id) ou em rascunho vira texto, sem link', () => {
    render(
      <RichContent
        data={lexicalDoc([
          internalLink({ relationTo: 'products', value: 7 }, 'produto escondido'),
          internalLink({ relationTo: 'products', value: { id: 8, slug: 'rasc', status: 'rascunho' } }, 'rascunho'),
        ])}
        products={new Map()}
      />,
    )
    expect(screen.getByText('produto escondido').closest('a')).toBeNull()
    expect(screen.getByText('rascunho').closest('a')).toBeNull()
  })
})
