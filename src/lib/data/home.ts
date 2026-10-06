import { getSitePayload } from './payload'

export type SearchChip = { label: string; href: string }

// Sugestões abaixo da busca (global "Página inicial"); em caso de erro, nenhuma
export async function getSearchChips(): Promise<SearchChip[]> {
  try {
    const payload = await getSitePayload()
    const home = await payload.findGlobal({ slug: 'home-page', depth: 0 })
    return (home.searchChips ?? []).filter((chip) => chip.label && chip.href).map((chip) => ({ label: chip.label, href: chip.href }))
  } catch {
    return []
  }
}
