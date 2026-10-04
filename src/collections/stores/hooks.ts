import { APIError } from 'payload'
import type { CollectionBeforeDeleteHook } from 'payload'

export const guardStoreDelete: CollectionBeforeDeleteHook = async ({ id, req }) => {
  const { totalDocs } = await req.payload.count({ collection: 'offers', where: { store: { equals: id } }, req })
  if (totalDocs > 0) {
    throw new APIError(
      `Não é possível apagar: ${totalDocs} oferta(s) usam esta loja. Marque a loja como inativa.`,
      409,
      undefined,
      true,
    )
  }
}
