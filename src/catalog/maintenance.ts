import type { Where } from 'payload'

export const STALE_OFFER_DAYS = 30

const DAY_MS = 86_400_000

export function staleOffersWhere(now: Date): Where {
  const limit = new Date(now.getTime() - STALE_OFFER_DAYS * DAY_MS).toISOString()
  return { and: [{ status: { equals: 'active' } }, { verifiedAt: { less_than: limit } }] }
}

export function productsWithoutActiveOfferWhere(): Where {
  return { and: [{ status: { not_equals: 'rascunho' } }, { hasActiveOffer: { equals: false } }] }
}

export const REVIEW_AFTER_MONTHS = 6

function reviewLimit(now: Date): string {
  const limit = new Date(now.getTime())
  limit.setUTCMonth(limit.getUTCMonth() - REVIEW_AFTER_MONTHS)
  return limit.toISOString()
}

// Revisão periódica (spec §5.8): conteúdos e produtos públicos revisados há mais de 6 meses
export function contentsToReviewWhere(now: Date): Where {
  return { and: [{ status: { in: ['publicado', 'agendado'] } }, { reviewedAt: { less_than: reviewLimit(now) } }] }
}

export function productsToReviewWhere(now: Date): Where {
  return { and: [{ status: { not_equals: 'rascunho' } }, { reviewedAt: { less_than: reviewLimit(now) } }] }
}

function flatten(value: unknown, prefix: string, out: [string, string][]): void {
  if (Array.isArray(value)) value.forEach((item, index) => flatten(item, `${prefix}[${index}]`, out))
  else if (value !== null && typeof value === 'object') {
    for (const [key, item] of Object.entries(value)) flatten(item, prefix ? `${prefix}[${key}]` : key, out)
  } else if (value !== undefined) out.push([prefix, String(value)])
}

// Formato where[and][0][campo][operador]=valor, usado pelas listas do painel
export function toQueryString(value: Record<string, unknown>): string {
  const out: [string, string][] = []
  flatten(value, '', out)
  return out.map(([key, item]) => `${encodeURIComponent(key)}=${encodeURIComponent(item)}`).join('&')
}

export function adminListUrl(collection: string, where: Where): string {
  return `/admin/collections/${collection}?${toQueryString({ where })}`
}
