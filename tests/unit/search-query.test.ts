import { describe, expect, it } from 'vitest'

import { normalizeSearchTerm, toTsQuery } from '@/content/search-query'

describe('termo de busca → tsquery', () => {
  it('palavras com prefixo, sem acento e minúsculas', () => {
    expect(toTsQuery('geladéira')).toBe('geladeira:*')
    expect(toTsQuery('ÁGUA')).toBe('agua:*')
    expect(toTsQuery('smart tv')).toBe('smart:* & tv:*')
    expect(toTsQuery('  Air   Fryer  ')).toBe('air:* & fryer:*')
  })

  it('pontuação vira separador e palavras de 1 caractere são descartadas', () => {
    expect(toTsQuery("o'neill")).toBe('neill:*')
    expect(toTsQuery('55" 4K')).toBe('55:* & 4k:*')
    expect(toTsQuery('lg-c4')).toBe('lg:* & c4:*')
  })

  it('entradas sem palavra útil viram null', () => {
    for (const term of ['c++', '%', '\\', '   ', '', 'a', "'", '&|!:*()']) expect(toTsQuery(term)).toBeNull()
  })

  it('limita a 80 caracteres e 8 palavras', () => {
    const long = 'palavra '.repeat(60)
    const query = toTsQuery(long)!
    expect(query.split(' & ')).toHaveLength(8)
    expect(toTsQuery('x'.repeat(500))).toBe(`${'x'.repeat(80)}:*`)
  })

  it('normaliza o termo exibido (espaços e tamanho)', () => {
    expect(normalizeSearchTerm('  tv   4k  ')).toBe('tv 4k')
    expect(normalizeSearchTerm(['a', 'b'])).toBe('a')
    expect(normalizeSearchTerm(undefined)).toBe('')
    expect(normalizeSearchTerm('y'.repeat(200))).toHaveLength(80)
  })
})
