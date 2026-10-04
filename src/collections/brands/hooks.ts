import { APIError } from 'payload'
import type { CollectionBeforeDeleteHook } from 'payload'

export const guardBrandDelete: CollectionBeforeDeleteHook = async ({ id, req }) => {
  const { totalDocs } = await req.payload.count({ collection: 'products', where: { brand: { equals: id } }, req })
  if (totalDocs > 0) {
    throw new APIError(`Não é possível apagar: ${totalDocs} produto(s) usam esta marca.`, 409, undefined, true)
  }
}
