// Busca (spec §6.9 e §12.3): ignora acentos e maiúsculas, aceita prefixos

export const MAX_TERM_LENGTH = 80
const MAX_WORDS = 8

// Termo como o visitante digitou, limpo para exibir e buscar
export function normalizeSearchTerm(value: string | string[] | undefined): string {
  const raw = Array.isArray(value) ? value[0] : value
  return (raw ?? '').replace(/\s+/g, ' ').trim().slice(0, MAX_TERM_LENGTH)
}

// tsquery do PostgreSQL: só [a-z0-9] chega ao banco (sem operadores digitados pelo visitante);
// cada palavra vira prefixo ("tv:*") e todas precisam aparecer (&). Nada útil → null.
export function toTsQuery(term: string): string | null {
  const words = normalizeSearchTerm(term)
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .split(' ')
    .filter((word) => word.length >= 2)
    .slice(0, MAX_WORDS)
  return words.length ? words.map((word) => `${word}:*`).join(' & ') : null
}
