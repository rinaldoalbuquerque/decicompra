import type { PayloadRequest } from 'payload'

import { planRedirect } from '../../content/redirects'

// Registra que o endereço público `from` passou a ser `to` (sem cadeias nem loops)
export async function applySlugRedirect(req: PayloadRequest, from: string, to: string): Promise<void> {
  if (from === to) return
  const { docs } = await req.payload.find({
    collection: 'redirects',
    where: { or: [{ from: { equals: to } }, { from: { equals: from } }, { to: { equals: from } }] },
    depth: 0,
    limit: 1000,
    req,
  })
  const plan = planRedirect(
    docs.map((doc) => ({ id: doc.id, from: doc.from, to: doc.to })),
    from,
    to,
  )
  for (const id of plan.remove) await req.payload.delete({ collection: 'redirects', id, req })
  for (const { id, to: target } of plan.retarget) {
    await req.payload.update({ collection: 'redirects', id, data: { to: target }, req })
  }
  if (plan.create) {
    const stale = docs.find((doc) => doc.from === plan.create!.from && !plan.remove.includes(doc.id))
    if (stale) await req.payload.update({ collection: 'redirects', id: stale.id, data: { to: plan.create.to, auto: true }, req })
    else await req.payload.create({ collection: 'redirects', data: { ...plan.create, type: '301', auto: true }, req })
  }
}
