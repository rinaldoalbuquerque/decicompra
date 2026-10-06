// Grupos da busca, na ordem da spec §6.9
export const SEARCH_GROUPS = [
  { type: 'products', label: 'Produtos' },
  { type: 'comparisons', label: 'Comparativos' },
  { type: 'best', label: 'Melhores' },
  { type: 'articles', label: 'Guias e Entenda' },
  { type: 'brands', label: 'Marcas' },
  { type: 'subcategories', label: 'Subcategorias' },
] as const

export type SearchGroupType = (typeof SEARCH_GROUPS)[number]['type']

type Item = { title: string; href: string }

export type SuggestionGroup = { type: SearchGroupType; label: string; items: Item[] }

// Sugestões do cabeçalho: até `max` itens, um de cada grupo por rodada (o mais relevante primeiro),
// devolvidos agrupados na ordem fixa
export function pickSuggestions(groups: Record<SearchGroupType, Item[]>, max = 6): SuggestionGroup[] {
  const taken = new Map<SearchGroupType, number>()
  let total = 0
  for (let round = 0; total < max; round++) {
    let added = false
    for (const { type } of SEARCH_GROUPS) {
      if (total >= max) break
      if (round < groups[type].length) {
        taken.set(type, round + 1)
        total++
        added = true
      }
    }
    if (!added) break
  }
  return SEARCH_GROUPS.filter(({ type }) => taken.has(type)).map(({ type, label }) => ({
    type,
    label,
    items: groups[type].slice(0, taken.get(type)).map(({ title, href }) => ({ title, href })),
  }))
}
