// Paginação das listas (spec §6.3 e §6.8): 24 por página, ?pagina=N
export const PER_PAGE = 24

// Só inteiros positivos escritos de forma simples; o resto vira a página 1
export function parsePage(value: string | string[] | undefined): number {
  if (typeof value !== 'string' || !/^[1-9]\d{0,5}$/.test(value)) return 1
  return Number(value)
}

export function pageCount(total: number, perPage = PER_PAGE): number {
  return Math.max(1, Math.ceil(total / perPage))
}

// Endereço de uma página da lista: filtros primeiro (ordem estável), a página 1 sem parâmetro
export function pageHref(basePath: string, page: number, extra: Record<string, string> = {}): string {
  const params = Object.entries(extra)
    .filter(([, value]) => value)
    .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
    .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
  if (page > 1) params.push(`pagina=${page}`)
  return params.length ? `${basePath}?${params.join('&')}` : basePath
}
