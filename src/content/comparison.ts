import type { Criterion, ScoreRow } from '../catalog/score'
import type { SpecAttribute, SpecRow } from '../catalog/spec-template'

// URL canônica: slugs dos produtos em ordem alfabética (spec §3.2)
export function comparisonSlug(productSlugs: string[]): string {
  // Ordem por ponto de código: igual em qualquer servidor (o roteador gera o mesmo endereço)
  return [...productSlugs].sort((a, b) => (a < b ? -1 : a > b ? 1 : 0)).join('-vs-')
}

// Identifica o conjunto de produtos, para não haver dois comparativos iguais
export function productSetKey(ids: number[]): string {
  return [...ids].sort((a, b) => a - b).join('-')
}

export type Winner = { key: string; winnerIds: number[] }

// Por critério vence a maior nota; empate devolve todos os empatados (spec §5.4)
export function criterionWinners(products: { id: number; scores: ScoreRow[] }[], criteria: Criterion[]): Winner[] {
  return criteria.map((criterion) => {
    const scored = products
      .map((product) => ({ id: product.id, score: product.scores.find((row) => row.key === criterion.key)?.score }))
      .filter((item): item is { id: number; score: number } => typeof item.score === 'number')
    if (scored.length === 0) return { key: criterion.key, winnerIds: [] }
    const best = Math.max(...scored.map((item) => item.score))
    return { key: criterion.key, winnerIds: scored.filter((item) => item.score === best).map((item) => item.id) }
  })
}

export type SpecOverride = { attributeKey: string; winner?: number | null; noWinner?: boolean | null }

function toNumber(value: string | null | undefined): number | null {
  const text = value?.trim().replace(',', '.')
  if (!text || !/^-?\d+(?:\.\d+)?$/.test(text)) return null
  return Number(text)
}

// Por atributo comparável: a direção sugere o vencedor; o editor pode ajustar ou marcar "sem vencedor".
// Atributo neutro, valores não numéricos ou todos iguais não têm destaque.
export function specWinners(
  template: SpecAttribute[],
  rowsByProduct: { productId: number; rows: SpecRow[] }[],
  overrides: SpecOverride[],
): Winner[] {
  return template
    .filter((attr) => attr.comparable !== false)
    .map((attr) => {
      const override = overrides.find((item) => item.attributeKey === attr.key)
      if (override?.noWinner) return { key: attr.key, winnerIds: [] }
      if (override?.winner) return { key: attr.key, winnerIds: [override.winner] }
      if (attr.direction !== 'higher' && attr.direction !== 'lower') return { key: attr.key, winnerIds: [] }
      const values = rowsByProduct
        .map((product) => ({ id: product.productId, value: toNumber(product.rows.find((row) => row.key === attr.key)?.value) }))
        .filter((item): item is { id: number; value: number } => item.value !== null)
      if (values.length < 2) return { key: attr.key, winnerIds: [] }
      const pickBest = attr.direction === 'higher' ? Math.max : Math.min
      const best = pickBest(...values.map((item) => item.value))
      const winners = values.filter((item) => item.value === best).map((item) => item.id)
      return { key: attr.key, winnerIds: winners.length === values.length ? [] : winners }
    })
}
