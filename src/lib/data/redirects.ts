import { notFound, permanentRedirect } from 'next/navigation'

import { getSitePayload } from './payload'

// Destino do endereço antigo (coleção "redirects"); null se não houver ou se apontar para si mesmo
export async function findRedirect(path: string): Promise<string | null> {
  const payload = await getSitePayload()
  const { docs } = await payload.find({ collection: 'redirects', where: { from: { equals: path } }, depth: 0, limit: 1, overrideAccess: false })
  const to = docs[0]?.to
  return to && to !== path ? to : null
}

// No lugar de notFound() nas páginas públicas: endereço antigo → 301, senão 404.
// `alternatives`: outros endereços equivalentes a consultar (ex.: o comparativo na ordem canônica).
export async function notFoundOrRedirect(path: string, ...alternatives: string[]): Promise<never> {
  for (const candidate of [path, ...alternatives]) {
    const to = await findRedirect(candidate)
    if (to && to !== path) permanentRedirect(to)
  }
  notFound()
}
