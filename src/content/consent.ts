// Consentimento de cookies (spec §10.3): Necessários sempre ativos; Estatísticas e Publicidade só com
// aceite. A escolha vale 12 meses e fica num cookie próprio (sem dado pessoal).

export const CONSENT_COOKIE = 'dc_consentimento'
const MAX_AGE_SECONDS = 365 * 24 * 60 * 60

export type Consent = { statistics: boolean; advertising: boolean; decidedAt: string }

export function readConsent(cookieHeader: string, now: Date = new Date()): Consent | null {
  const raw = cookieHeader
    .split(';')
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${CONSENT_COOKIE}=`))
    ?.slice(CONSENT_COOKIE.length + 1)
  if (!raw) return null
  try {
    const data = JSON.parse(decodeURIComponent(raw)) as Partial<Consent>
    if (typeof data.statistics !== 'boolean' || typeof data.advertising !== 'boolean' || typeof data.decidedAt !== 'string') return null
    const decided = new Date(data.decidedAt).getTime()
    if (Number.isNaN(decided) || now.getTime() - decided > MAX_AGE_SECONDS * 1000) return null
    return { statistics: data.statistics, advertising: data.advertising, decidedAt: data.decidedAt }
  } catch {
    return null
  }
}

export function consentCookie(choice: { statistics: boolean; advertising: boolean }, now: Date = new Date()): string {
  const value = encodeURIComponent(JSON.stringify({ ...choice, decidedAt: now.toISOString() }))
  return `${CONSENT_COOKIE}=${value}; Max-Age=${MAX_AGE_SECONDS}; Path=/; SameSite=Lax`
}

type Signal = 'granted' | 'denied'

// Google Consent Mode v2: tudo negado até a escolha
export function consentSignals(consent: Consent | null): {
  analytics_storage: Signal
  ad_storage: Signal
  ad_user_data: Signal
  ad_personalization: Signal
} {
  const stats: Signal = consent?.statistics ? 'granted' : 'denied'
  const ads: Signal = consent?.advertising ? 'granted' : 'denied'
  return { analytics_storage: stats, ad_storage: ads, ad_user_data: ads, ad_personalization: ads }
}
