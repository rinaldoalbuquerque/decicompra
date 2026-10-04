import { KEY_PATTERN } from './spec-template'

export type Criterion = { key: string; name: string; weight: number; description?: string | null }

export type ScoreRow = {
  id?: string | null
  key: string
  label?: string | null
  score?: number | null
  justification?: string | null
}

export function syncScoreRows(criteria: Criterion[], rows: ScoreRow[] | null | undefined): ScoreRow[] {
  const byKey = new Map((rows ?? []).map((row) => [row.key, row]))
  return criteria.map((criterion) => {
    const label = `${criterion.name} (${criterion.weight}%)`
    const existing = byKey.get(criterion.key)
    return existing ? { ...existing, key: criterion.key, label } : { key: criterion.key, label, score: null }
  })
}

// Média ponderada (pesos somam 100) com uma casa decimal; vazia se faltar alguma nota
export function computeFinalScore(criteria: Criterion[], rows: ScoreRow[]): number | null {
  if (criteria.length === 0) return null
  const scores = new Map(rows.map((row) => [row.key, row.score]))
  let total = 0
  for (const criterion of criteria) {
    const score = scores.get(criterion.key)
    if (score === null || score === undefined || Number.isNaN(score)) return null
    total += criterion.weight * score
  }
  return Math.round((total / 100 + Number.EPSILON) * 10) / 10
}

export function validateCriteria(criteria: Criterion[]): string[] {
  if (criteria.length === 0) return []
  const errors: string[] = []
  const seen = new Set<string>()
  for (const criterion of criteria) {
    if (seen.has(criterion.key)) errors.push(`A chave "${criterion.key}" está repetida.`)
    seen.add(criterion.key)
    if (!KEY_PATTERN.test(criterion.key)) {
      errors.push(`A chave "${criterion.key}" é inválida: use letras minúsculas, números e _ (ex.: custo_beneficio).`)
    }
    if (!(criterion.weight > 0)) errors.push(`O peso de "${criterion.name}" precisa ser maior que zero.`)
  }
  const sum = criteria.reduce((acc, criterion) => acc + (criterion.weight || 0), 0)
  if (Math.abs(sum - 100) > 1e-9) errors.push(`A soma dos pesos precisa ser exatamente 100 (atual: ${sum}).`)
  return errors
}

export function scoreBand(score: number): string {
  if (score >= 9) return 'Excepcional'
  if (score >= 8) return 'Muito bom'
  if (score >= 7) return 'Bom'
  if (score >= 6) return 'Regular'
  return 'Não recomendado'
}
