import { describe, expect, it } from 'vitest'

import {
  missingRequiredSpecs,
  normalizeSpecValue,
  specValueErrors,
  syncSpecRows,
  validateSpecTemplate,
  validateSpecValue,
  type SpecAttribute,
} from '@/catalog/spec-template'

const template: SpecAttribute[] = [
  { key: 'painel', label: 'Painel', type: 'option', options: ['OLED', 'QLED', 'LED'], required: true },
  { key: 'taxa_atualizacao', label: 'Taxa de atualização', type: 'number', unit: 'Hz' },
  { key: 'tamanho', label: 'Tamanho', type: 'number', unit: '"', perVariant: true, required: true },
  { key: 'dolby_vision', label: 'Dolby Vision', type: 'boolean' },
]

describe('syncSpecRows', () => {
  it('cria uma linha por atributo do escopo, na ordem do modelo, com rótulo e unidade', () => {
    expect(syncSpecRows(template, [], 'product')).toEqual([
      { key: 'painel', label: 'Painel', value: null },
      { key: 'taxa_atualizacao', label: 'Taxa de atualização (Hz)', value: null },
      { key: 'dolby_vision', label: 'Dolby Vision', value: null },
    ])
    expect(syncSpecRows(template, null, 'variant')).toEqual([{ key: 'tamanho', label: 'Tamanho (")', value: null }])
  })

  it('preserva valores e ids existentes e descarta chaves que saíram do modelo', () => {
    const rows = [
      { id: 'r1', key: 'dolby_vision', value: 'sim' },
      { id: 'r2', key: 'antigo', value: 'x' },
    ]
    const synced = syncSpecRows(template, rows, 'product')
    expect(synced.map((r) => r.key)).toEqual(['painel', 'taxa_atualizacao', 'dolby_vision'])
    expect(synced[2]).toEqual({ id: 'r1', key: 'dolby_vision', label: 'Dolby Vision', value: 'sim' })
  })
})

describe('validateSpecValue', () => {
  const [painel, taxa, , dolby] = template

  it('aceita vazio (obrigatoriedade é checada só na publicação)', () => {
    expect(validateSpecValue(taxa, '')).toBeNull()
    expect(validateSpecValue(taxa, null)).toBeNull()
  })

  it.each(['120', '4,5', '4.5', '-2'])('número aceita %s (vírgula decimal inclusive)', (v) => {
    expect(validateSpecValue(taxa, v)).toBeNull()
  })

  it('número recusa texto', () => {
    expect(validateSpecValue(taxa, '120Hz')).toBe('"Taxa de atualização" precisa ser um número.')
  })

  it('sim/não', () => {
    expect(validateSpecValue(dolby, 'Sim')).toBeNull()
    expect(validateSpecValue(dolby, 'nao')).toBeNull()
    expect(validateSpecValue(dolby, 'talvez')).toBe('"Dolby Vision" precisa ser "sim" ou "não".')
  })

  it('opção', () => {
    expect(validateSpecValue(painel, 'OLED')).toBeNull()
    expect(validateSpecValue(painel, 'Plasma')).toBe('"Painel" precisa ser uma das opções: OLED, QLED, LED.')
  })
})

describe('specValueErrors e missingRequiredSpecs', () => {
  it('lista erros de tipo e obrigatórios vazios do escopo', () => {
    const rows = [
      { key: 'painel', value: '' },
      { key: 'taxa_atualizacao', value: 'rápida' },
    ]
    expect(specValueErrors(template, rows)).toEqual(['"Taxa de atualização" precisa ser um número.'])
    expect(missingRequiredSpecs(template, rows, 'product')).toEqual(['Painel'])
    expect(missingRequiredSpecs(template, [], 'variant')).toEqual(['Tamanho'])
  })
})

describe('validateSpecTemplate', () => {
  it('aceita um modelo válido', () => {
    expect(validateSpecTemplate(template)).toEqual([])
  })

  it('recusa chave repetida, chave fora do padrão e opção sem lista', () => {
    expect(
      validateSpecTemplate([
        { key: 'painel', label: 'A', type: 'text' },
        { key: 'painel', label: 'B', type: 'text' },
        { key: 'Taxa Hz', label: 'C', type: 'number' },
        { key: 'cor', label: 'Cor', type: 'option', options: [] },
      ]),
    ).toEqual([
      'A chave "painel" está repetida.',
      'A chave "Taxa Hz" é inválida: use letras minúsculas, números e _ (ex.: taxa_atualizacao).',
      'O atributo "Cor" é do tipo opção e precisa de pelo menos uma opção.',
    ])
  })
})

describe('normalizeSpecValue', () => {
  const [painel, taxa, , dolby] = template

  it('guarda números com ponto decimal e sem espaços', () => {
    expect(normalizeSpecValue(taxa, ' 4,5 ')).toBe('4.5')
    expect(normalizeSpecValue(taxa, '120')).toBe('120')
  })

  it('padroniza sim/não', () => {
    expect(normalizeSpecValue(dolby, ' Sim ')).toBe('sim')
    expect(normalizeSpecValue(dolby, 'nao')).toBe('não')
    expect(normalizeSpecValue(dolby, 'NÃO')).toBe('não')
  })

  it('apara opções e textos; vazio vira null', () => {
    expect(normalizeSpecValue(painel, ' OLED ')).toBe('OLED')
    expect(normalizeSpecValue(painel, '   ')).toBeNull()
    expect(normalizeSpecValue(taxa, null)).toBeNull()
  })

  it('não mexe em valor inválido (a validação aponta o erro)', () => {
    expect(normalizeSpecValue(taxa, '120Hz')).toBe('120Hz')
  })
})
