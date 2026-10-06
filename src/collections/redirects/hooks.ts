import { ValidationError } from 'payload'
import type { CollectionAfterChangeHook, CollectionAfterDeleteHook, CollectionBeforeChangeHook } from 'payload'

import { pick } from '../../lib/relations'
import { revalidatePaths } from '../../lib/revalidate'

const MAX_HOPS = 20

// Os redirecionamentos são servidos ao visitante: um laço (A → B → A) deixaria a página girando
// sem fim. Segue a cadeia a partir do destino e recusa se ela voltar à origem.
export const preventRedirectLoop: CollectionBeforeChangeHook = async ({ data, originalDoc, req }) => {
  const from = pick<string>(data, originalDoc, 'from')
  const to = pick<string>(data, originalDoc, 'to')
  if (!from || !to) return data
  const loop = () =>
    new ValidationError({ collection: 'redirects', errors: [{ path: 'to', message: 'Este destino criaria um laço de redirecionamentos.' }] })
  if (from === to) throw loop()
  let current = to
  for (let hop = 0; hop < MAX_HOPS; hop++) {
    const { docs } = await req.payload.find({ collection: 'redirects', where: { from: { equals: current } }, depth: 0, limit: 1, req })
    const next = docs[0]
    if (!next || next.id === originalDoc?.id) return data
    if (next.to === from) throw loop()
    current = next.to
  }
  throw loop()
}

// A página do endereço antigo pode estar guardada como 404: refaz para valer o redirecionamento
export const revalidateRedirect: CollectionAfterChangeHook = async ({ doc, previousDoc }) => {
  await revalidatePaths([doc.from, ...(previousDoc?.from && previousDoc.from !== doc.from ? [previousDoc.from] : [])])
  return doc
}

export const revalidateDeletedRedirect: CollectionAfterDeleteHook = async ({ doc }) => {
  if (doc.from) await revalidatePaths([doc.from])
}
