import { describe, expect, it } from 'vitest'

import { computeFinalScore, scoreBand, syncScoreRows, validateCriteria, type Criterion } from '@/catalog/score'

const criteria: Criterion[] = [
  { key: 'imagem', name: 'Imagem', weight: 60 },
  { key: 'custo_beneficio', name: 'Custo-benefício', weight: 40 },
]

describe('syncScoreRows', () => {
  it('uma linha por critério, com rótulo "Nome (peso%)", preservando notas', () => {
    expect(syncScoreRows(criteria, [{ id: 'x', key: 'custo_beneficio', score: 7 }, { key: 'velho', score: 1 }])).toEqual([
      { key: 'imagem', label: 'Imagem (60%)', score: null },
      { id: 'x', key: 'custo_beneficio', label: 'Custo-benefício (40%)', score: 7 },
    ])
  })
})

describe('computeFinalScore', () => {
  it('média ponderada com uma casa decimal', () => {
    expect(computeFinalScore(criteria, [{ key: 'imagem', score: 9 }, { key: 'custo_beneficio', score: 7.5 }])).toBe(8.4)
    expect(computeFinalScore(criteria, [{ key: 'imagem', score: 8.3 }, { key: 'custo_beneficio', score: 7.1 }])).toBe(7.8)
  })

  it('vazia quando falta nota ou não há critérios', () => {
    expect(computeFinalScore(criteria, [{ key: 'imagem', score: 9 }])).toBeNull()
    expect(computeFinalScore(criteria, [{ key: 'imagem', score: 9 }, { key: 'custo_beneficio', score: null }])).toBeNull()
    expect(computeFinalScore([], [])).toBeNull()
  })
})

describe('validateCriteria', () => {
  it('aceita pesos que somam 100 e lista vazia', () => {
    expect(validateCriteria(criteria)).toEqual([])
    expect(validateCriteria([])).toEqual([])
  })

  it('recusa soma diferente de 100, peso não positivo e chave repetida', () => {
    expect(
      validateCriteria([
        { key: 'imagem', name: 'Imagem', weight: 70 },
        { key: 'imagem', name: 'Imagem 2', weight: 0 },
      ]),
    ).toEqual([
      'A chave "imagem" está repetida.',
      'O peso de "Imagem 2" precisa ser maior que zero.',
      'A soma dos pesos precisa ser exatamente 100 (atual: 70).',
    ])
  })
})

describe('scoreBand', () => {
  it.each([
    [9.5, 'Excepcional'],
    [9, 'Excepcional'],
    [8.9, 'Muito bom'],
    [8, 'Muito bom'],
    [7.2, 'Bom'],
    [6, 'Regular'],
    [5.9, 'Não recomendado'],
  ])('%s → %s', (score, band) => {
    expect(scoreBand(score)).toBe(band)
  })
})
