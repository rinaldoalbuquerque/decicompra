import { describe, expect, it } from 'vitest'

import { comparisonSlug, criterionWinners, productSetKey, specWinners } from '@/content/comparison'
import {
  checkContentPublication,
  effectiveMetaDescription,
  extractProductIds,
  isPubliclyVisible,
  type ContentPublicationInput,
} from '@/content/rules'

const lexical = {
  root: {
    type: 'root',
    children: [
      { type: 'paragraph', children: [{ type: 'text', text: 'oi' }] },
      { type: 'block', fields: { blockType: 'productCard', product: 7 } },
      { type: 'block', fields: { blockType: 'comparisonTable', products: [3, { id: 9 }, 7] } },
      { type: 'list', children: [{ type: 'listitem', children: [{ type: 'block', fields: { blockType: 'offerButton', product: { id: 2 } } }] }] },
    ],
  },
}

describe('extractProductIds', () => {
  it('acha produtos nos blocos (inclusive aninhados) e nos campos por tipo, sem repetir', () => {
    expect(
      extractProductIds({
        body: lexical,
        picks: [{ product: 11 }, { product: { id: 7 } }],
        alsoConsidered: [{ product: 12 }],
        comparedProducts: [5, { id: 6 }],
        badges: [{ product: 5 }],
        chooseIf: [{ product: 6 }],
        specOverrides: [{ winner: 13 }, { winner: null }],
      }),
    ).toEqual([2, 3, 5, 6, 7, 9, 11, 12, 13])
  })

  it('aceita vazio', () => {
    expect(extractProductIds({})).toEqual([])
  })
})

describe('comparativo: slug e conjunto', () => {
  it('slug canônico independe da ordem', () => {
    expect(comparisonSlug(['samsung-s90d', 'lg-c4'])).toBe('lg-c4-vs-samsung-s90d')
    expect(comparisonSlug(['lg-c4', 'samsung-s90d'])).toBe('lg-c4-vs-samsung-s90d')
    expect(comparisonSlug(['c', 'a', 'b'])).toBe('a-vs-b-vs-c')
  })

  it('chave do conjunto ordena os ids numericamente', () => {
    expect(productSetKey([10, 2, 33])).toBe('2-10-33')
  })
})

describe('meta descrição e publicação', () => {
  const SUMMARY = 'Comparamos as duas OLEDs mais vendidas do Brasil e dizemos qual vale mais para filmes e games.'
  const base: ContentPublicationInput = {
    type: 'guia',
    status: 'publicado',
    summary: SUMMARY,
    metaDescription: null,
    sourcesCount: 1,
    reviewedAt: '2026-10-04T00:00:00.000Z',
    picksCount: 0,
    comparedCount: 0,
  }

  it('meta efetiva: a meta ou, vazia, o resumo', () => {
    expect(effectiveMetaDescription('  Meta  ', 'Resumo')).toBe('Meta')
    expect(effectiveMetaDescription(' ', ' Resumo ')).toBe('Resumo')
    expect(effectiveMetaDescription(null, null)).toBe('')
  })

  it('rascunho e em revisão não têm requisitos', () => {
    expect(checkContentPublication({ ...base, status: 'rascunho', summary: null, sourcesCount: 0 })).toEqual([])
    expect(checkContentPublication({ ...base, status: 'em_revisao', summary: null, sourcesCount: 0 })).toEqual([])
  })

  it('guia completo passa', () => {
    expect(checkContentPublication(base)).toEqual([])
    expect(checkContentPublication({ ...base, status: 'agendado' })).toEqual([])
  })

  it('lista os requisitos comuns que faltam', () => {
    expect(checkContentPublication({ ...base, summary: '', sourcesCount: 0, reviewedAt: null })).toEqual([
      'Escreva o resumo rápido.',
      'A meta descrição (ou o resumo, se ela estiver vazia) precisa ter de 70 a 160 caracteres.',
      'Cite pelo menos 1 fonte.',
      'Informe a data de revisão.',
    ])
  })

  it('Melhores precisa de 3 a 10 escolhas; Comparativo de 2 ou 3 produtos', () => {
    expect(checkContentPublication({ ...base, type: 'melhores', picksCount: 2 })).toEqual([
      'Uma lista de Melhores precisa de 3 a 10 escolhas.',
    ])
    expect(checkContentPublication({ ...base, type: 'melhores', picksCount: 3 })).toEqual([])
    expect(checkContentPublication({ ...base, type: 'comparativo', comparedCount: 1 })).toEqual([
      'Um comparativo precisa de 2 ou 3 produtos.',
    ])
    expect(checkContentPublication({ ...base, type: 'comparativo', comparedCount: 2 })).toEqual([])
  })
})

describe('isPubliclyVisible', () => {
  const now = new Date('2026-10-04T12:00:00.000Z')
  it('só publicado/agendado com data já alcançada', () => {
    expect(isPubliclyVisible('publicado', '2026-10-04T11:00:00.000Z', now)).toBe(true)
    expect(isPubliclyVisible('agendado', '2026-10-05T00:00:00.000Z', now)).toBe(false)
    expect(isPubliclyVisible('agendado', '2026-10-04T12:00:00.000Z', now)).toBe(true)
    expect(isPubliclyVisible('em_revisao', '2026-10-01T00:00:00.000Z', now)).toBe(false)
    expect(isPubliclyVisible('publicado', null, now)).toBe(false)
  })
})

describe('vencedores (spec §5.4)', () => {
  const criteria = [
    { key: 'imagem', name: 'Imagem', weight: 60 },
    { key: 'som', name: 'Som', weight: 40 },
  ]

  it('por critério: maior nota vence; empate devolve os empatados', () => {
    expect(
      criterionWinners(
        [
          { id: 1, scores: [{ key: 'imagem', score: 9.2 }, { key: 'som', score: 7 }] },
          { id: 2, scores: [{ key: 'imagem', score: 9 }, { key: 'som', score: 7 }] },
        ],
        criteria,
      ),
    ).toEqual([
      { key: 'imagem', winnerIds: [1] },
      { key: 'som', winnerIds: [1, 2] },
    ])
  })

  it('por atributo: direção, vírgula decimal, neutro, iguais e ajuste do editor', () => {
    const template = [
      { key: 'hz', label: 'Hz', type: 'number' as const, direction: 'higher' as const },
      { key: 'consumo', label: 'Consumo', type: 'number' as const, direction: 'lower' as const },
      { key: 'sistema', label: 'Sistema', type: 'text' as const, direction: 'neutral' as const },
      { key: 'portas', label: 'Portas', type: 'number' as const, direction: 'higher' as const },
      { key: 'peso', label: 'Peso', type: 'number' as const, direction: 'lower' as const },
      { key: 'oculto', label: 'Oculto', type: 'number' as const, direction: 'higher' as const, comparable: false },
    ]
    const rows = [
      { productId: 1, rows: [{ key: 'hz', value: '144' }, { key: 'consumo', value: '95,5' }, { key: 'sistema', value: 'webOS' }, { key: 'portas', value: '4' }, { key: 'peso', value: '18' }] },
      { productId: 2, rows: [{ key: 'hz', value: '120' }, { key: 'consumo', value: '88.0' }, { key: 'sistema', value: 'Tizen' }, { key: 'portas', value: '4' }, { key: 'peso', value: '15' }] },
    ]
    expect(specWinners(template, rows, [{ attributeKey: 'peso', winner: null, noWinner: true }])).toEqual([
      { key: 'hz', winnerIds: [1] },
      { key: 'consumo', winnerIds: [2] },
      { key: 'sistema', winnerIds: [] },
      { key: 'portas', winnerIds: [] },
      { key: 'peso', winnerIds: [] },
    ])
    expect(specWinners(template, rows, [{ attributeKey: 'hz', winner: 2 }])[0]).toEqual({ key: 'hz', winnerIds: [2] })
  })
})
