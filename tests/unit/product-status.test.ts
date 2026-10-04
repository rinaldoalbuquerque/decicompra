import { describe, expect, it } from 'vitest'

import { checkProductPublication, type PublicationInput } from '@/catalog/product-status'

const VERDICT = 'Uma TV OLED excelente para filmes e games, com contraste perfeito e preço competitivo no Brasil.'

const ficha: PublicationInput = {
  status: 'ficha',
  finalScore: 8.6,
  imageCount: 1,
  variantCount: 1,
  missingSpecs: [],
  verdict: null,
  prosCount: 0,
  consCount: 0,
  metaDescription: null,
  sourcesCount: 0,
  reviewedAt: null,
}

const analise: PublicationInput = {
  ...ficha,
  status: 'analise',
  verdict: VERDICT,
  prosCount: 3,
  consCount: 2,
  sourcesCount: 1,
  reviewedAt: '2026-10-03T00:00:00.000Z',
}

describe('checkProductPublication', () => {
  it('rascunho não tem requisitos', () => {
    expect(checkProductPublication({ ...ficha, status: 'rascunho', finalScore: null, imageCount: 0, variantCount: 0 })).toEqual([])
  })

  it('ficha completa passa', () => {
    expect(checkProductPublication(ficha)).toEqual([])
  })

  it('ficha exige nota completa, imagem, variante e especificações obrigatórias', () => {
    expect(
      checkProductPublication({ ...ficha, finalScore: null, imageCount: 0, variantCount: 0, missingSpecs: ['Painel', 'Tamanho (55")'] }),
    ).toEqual([
      'Preencha a nota de todos os critérios.',
      'Adicione pelo menos 1 imagem.',
      'Cadastre pelo menos 1 variante.',
      'Especificações obrigatórias sem valor: Painel, Tamanho (55").',
    ])
  })

  it('análise completa passa (o veredito serve de meta descrição)', () => {
    expect(checkProductPublication(analise)).toEqual([])
  })

  it('análise exige veredito, 3–6 prós, 2–5 contras, fonte e data de revisão', () => {
    expect(
      checkProductPublication({ ...analise, verdict: ' ', prosCount: 7, consCount: 1, sourcesCount: 0, reviewedAt: null }),
    ).toEqual([
      'Escreva o veredito (uma frase).',
      'Liste de 3 a 6 pontos positivos.',
      'Liste de 2 a 5 pontos negativos.',
      'A meta descrição (ou o veredito, se ela estiver vazia) precisa ter de 70 a 160 caracteres.',
      'Cite pelo menos 1 fonte.',
      'Informe a data de revisão.',
    ])
  })

  it('meta descrição preenchida tem prioridade sobre o veredito', () => {
    expect(checkProductPublication({ ...analise, metaDescription: 'curta' })).toEqual([
      'A meta descrição (ou o veredito, se ela estiver vazia) precisa ter de 70 a 160 caracteres.',
    ])
  })
})

describe('subcategoria sem critérios', () => {
  it('explica que faltam critérios na subcategoria', () => {
    const errors = checkProductPublication({ ...ficha, finalScore: null, criteriaCount: 0 })
    expect(errors).toContain('A subcategoria ainda não tem critérios de nota; cadastre-os antes de publicar.')
    expect(errors).not.toContain('Preencha a nota de todos os critérios.')
  })
})
