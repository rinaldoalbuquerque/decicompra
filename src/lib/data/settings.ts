import { cache } from 'react'

import { ADSENSE_CLIENT_PATTERN, GA4_ID_PATTERN, SEARCH_CONSOLE_TOKEN_PATTERN } from '@/content/seo'

import { getSitePayload } from './payload'

export type PublicSettings = {
  indexingEnabled: boolean
  searchConsoleVerification: string | null
  ga4Id: string | null
  adsEnabled: boolean
  adsenseClientId: string | null
  adSlots: { placement: 'home' | 'content' | 'sidebar'; slotId: string }[]
  adsTxt: string
  responsibleName: string | null
  privacyEmail: string | null
}

const SAFE_DEFAULTS: PublicSettings = {
  indexingEnabled: false,
  searchConsoleVerification: null,
  ga4Id: null,
  adsEnabled: false,
  adsenseClientId: null,
  adSlots: [],
  adsTxt: '',
  responsibleName: null,
  privacyEmail: null,
}

const valid = (value: string | null | undefined, pattern: RegExp) => (value && pattern.test(value) ? value : null)

// Configurações que as páginas usam (uma leitura por renderização). Em caso de erro, o padrão seguro:
// site fora do Google, sem medição e sem anúncios.
export const getPublicSettings = cache(async (): Promise<PublicSettings> => {
  try {
    const payload = await getSitePayload()
    const settings = await payload.findGlobal({ slug: 'site-settings', depth: 0 })
    return {
      indexingEnabled: Boolean(settings.indexingEnabled),
      searchConsoleVerification: valid(settings.searchConsoleVerification, SEARCH_CONSOLE_TOKEN_PATTERN),
      ga4Id: valid(settings.ga4Id, GA4_ID_PATTERN),
      adsEnabled: Boolean(settings.adsEnabled),
      adsenseClientId: valid(settings.adsenseClientId, ADSENSE_CLIENT_PATTERN),
      adSlots: (settings.adSlots ?? []).map(({ placement, slotId }) => ({ placement, slotId })),
      adsTxt: settings.adsTxt ?? '',
      responsibleName: settings.responsibleName?.trim() || null,
      privacyEmail: settings.privacyEmail?.trim() || null,
    }
  } catch {
    return SAFE_DEFAULTS
  }
})

// Anúncios ligados no painel (spec §10.2); em caso de erro, desligados
export async function getAdsEnabled(): Promise<boolean> {
  return (await getPublicSettings()).adsEnabled
}
