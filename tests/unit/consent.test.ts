import { describe, expect, it } from 'vitest'

import { CONSENT_COOKIE, consentCookie, consentSignals, readConsent } from '@/content/consent'

const now = new Date('2026-10-06T12:00:00.000Z')

describe('consentimento de cookies (LGPD, Consent Mode v2)', () => {
  it('sem escolha: nada (o aviso aparece)', () => {
    expect(readConsent('', now)).toBeNull()
    expect(readConsent('outro=1', now)).toBeNull()
  })

  it('lê a escolha guardada no cookie', () => {
    const cookie = `a=1; ${CONSENT_COOKIE}=${encodeURIComponent(JSON.stringify({ statistics: true, advertising: false, decidedAt: '2026-09-01T00:00:00.000Z' }))}`
    expect(readConsent(cookie, now)).toEqual({ statistics: true, advertising: false, decidedAt: '2026-09-01T00:00:00.000Z' })
  })

  it('escolha com mais de 12 meses ou corrompida é ignorada (pergunta de novo)', () => {
    const old = `${CONSENT_COOKIE}=${encodeURIComponent(JSON.stringify({ statistics: true, advertising: true, decidedAt: '2025-09-01T00:00:00.000Z' }))}`
    expect(readConsent(old, now)).toBeNull()
    expect(readConsent(`${CONSENT_COOKIE}=%7Bquebrado`, now)).toBeNull()
    expect(readConsent(`${CONSENT_COOKIE}=${encodeURIComponent('{"statistics":"sim"}')}`, now)).toBeNull()
  })

  it('cookie gravado por 12 meses, em todo o site', () => {
    const value = consentCookie({ statistics: false, advertising: true }, now)
    expect(value).toContain(`${CONSENT_COOKIE}=`)
    expect(value).toContain('Max-Age=31536000')
    expect(value).toContain('Path=/')
    expect(value).toContain('SameSite=Lax')
    expect(readConsent(value.split(';')[0], now)).toEqual({ statistics: false, advertising: true, decidedAt: now.toISOString() })
  })

  it('sinais do Consent Mode: tudo negado por padrão; cada categoria libera os seus', () => {
    expect(consentSignals(null)).toEqual({ analytics_storage: 'denied', ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied' })
    expect(consentSignals({ statistics: true, advertising: false, decidedAt: '' })).toEqual({
      analytics_storage: 'granted',
      ad_storage: 'denied',
      ad_user_data: 'denied',
      ad_personalization: 'denied',
    })
    expect(consentSignals({ statistics: false, advertising: true, decidedAt: '' })).toEqual({
      analytics_storage: 'denied',
      ad_storage: 'granted',
      ad_user_data: 'granted',
      ad_personalization: 'granted',
    })
  })
})
