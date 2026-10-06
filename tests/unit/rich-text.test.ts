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

  it('não repete os ids das seções fixas das páginas', () => {
    const doc = lexicalDoc([heading('h2', 'Como escolher'), heading('h2', 'FAQ'), heading('h2', 'Onde comprar'), heading('h2', 'Notas título')])
    expect(extractHeadings(doc).map((entry) => entry.id)).toEqual(['como-escolher-2', 'faq-2', 'onde-comprar-2', 'notas-titulo-2'])
  })

  it('aceita vazio', () => {
    expect(extractHeadings(null)).toEqual([])
  })
})
