import { describe, expect, it } from 'vitest'

import { pickSuggestions } from '@/content/search-suggestions'

const items = (prefix: string, n: number) => Array.from({ length: n }, (_, i) => ({ id: i, title: `${prefix}${i}`, href: `/${prefix}${i}/` }))

describe('sugestões da busca', () => {
  it('até 6 itens, intercalando os grupos, devolvidos agrupados na ordem fixa', () => {
    const result = pickSuggestions({
      products: items('p', 5),
      comparisons: items('c', 1),
      best: [],
      articles: items('a', 5),
      brands: items('m', 1),
      subcategories: [],
    })
    expect(result.map((group) => group.type)).toEqual(['products', 'comparisons', 'articles', 'brands'])
    expect(result.flatMap((group) => group.items.map((item) => item.title))).toEqual(['p0', 'p1', 'c0', 'a0', 'a1', 'm0'])
    expect(result[0].label).toBe('Produtos')
    expect(result[0].items[0]).toEqual({ title: 'p0', href: '/p0/' })
  })

  it('sem resultados devolve lista vazia', () => {
    expect(pickSuggestions({ products: [], comparisons: [], best: [], articles: [], brands: [], subcategories: [] })).toEqual([])
  })
})
