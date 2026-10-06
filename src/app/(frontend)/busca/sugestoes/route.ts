import { normalizeSearchTerm } from '@/content/search-query'
import { pickSuggestions } from '@/content/search-suggestions'
import { searchAll } from '@/lib/data/search'

// Sugestões do cabeçalho (spec §6.9): até 6 itens agrupados; a CDN guarda cada termo por 5 min
export async function GET(request: Request) {
  const term = normalizeSearchTerm(new URL(request.url).searchParams.get('q') ?? undefined)
  const groups = term.length >= 2 ? pickSuggestions(await searchAll(term, { perGroup: 6 })) : []
  return Response.json(
    { groups },
    { headers: { 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600', 'X-Robots-Tag': 'noindex' } },
  )
}
