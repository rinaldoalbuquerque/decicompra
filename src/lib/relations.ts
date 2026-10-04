// ID de um relacionamento, venha ele como número, texto ou documento populado
export function relId(value: unknown): number | string | null {
  if (value === null || value === undefined || value === '') return null
  if (typeof value === 'number' || typeof value === 'string') return value
  if (typeof value === 'object' && 'id' in value) return relId((value as { id: unknown }).id)
  return null
}

// Valor de um campo durante um hook: o dado novo quando a chave veio; senão, o do documento original
export function pick<T = unknown>(
  data: Record<string, unknown> | undefined,
  original: Record<string, unknown> | undefined,
  key: string,
): T | undefined {
  if (data && key in data) return data[key] as T
  return original?.[key] as T | undefined
}
