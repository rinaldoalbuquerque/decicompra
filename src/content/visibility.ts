// Regras de indexação da spec §5.5 que dependem de contagens

// Marca só é indexada com ao menos 3 itens públicos (produtos em análise ou conteúdos que a citam)
export const BRAND_MIN_PUBLIC_ITEMS = 3

export function isBrandIndexable(publicItems: number): boolean {
  return publicItems >= BRAND_MIN_PUBLIC_ITEMS
}
