import { describe, expect, it } from 'vitest'

import { extractHeadings, headingId } from '@/content/rich-text'
import { block, heading, lexicalDoc, paragraph } from '@/seed/lexical'

describe('índice dos títulos', () => {
  it('id estável a partir do texto', () => {
    expect(headingId('Tamanho certo da TV')).toBe('tamanho-certo-da-tv')
  })

  it('lista os h2 e h3 em ordem, ignorando o resto, e evita ids repetidos', () => {
    const doc = lexicalDoc([
      heading('h2', 'Imagem'),
      paragraph('texto'),
      heading('h3', 'Brilho'),
      block({ blockType: 'tip', text: 'x' }),
      heading('h2', 'Imagem'),
    ])
    expect(extractHeadings(doc)).toEqual([
      { id: 'imagem', text: 'Imagem', level: 2 },
      { id: 'brilho', text: 'Brilho', level: 3 },
      { id: 'imagem-2', text: 'Imagem', level: 2 },
    ])
  })

  it('aceita vazio', () => {
    expect(extractHeadings(null)).toEqual([])
  })
})
