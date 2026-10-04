export type ExistingRedirect = { id: number | string; from: string; to: string }

export type RedirectPlan = {
  create?: { from: string; to: string }
  retarget: { id: number | string; to: string }[]
  remove: (number | string)[]
}

// O que fazer quando um endereço público muda de `from` para `to`, sem cadeias nem loops
export function planRedirect(existing: ExistingRedirect[], from: string, to: string): RedirectPlan {
  if (from === to) return { retarget: [], remove: [] }
  const remove = existing.filter((r) => r.from === to).map((r) => r.id)
  const retarget = existing.filter((r) => r.to === from && r.from !== to).map((r) => ({ id: r.id, to }))
  const alreadyExists = existing.some((r) => r.from === from && r.to === to)
  return { ...(alreadyExists ? {} : { create: { from, to } }), retarget, remove }
}
