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

const valid = (value: string | null | undefined, pattern: RegExp) => (value && pattern.test(value) ? value : null)

// Configurações que as páginas usam (uma leitura por renderização). Uma falha no banco NÃO vira
// "site fora do Google": o erro sobe, a regeneração falha e o Next continua servindo a última versão
// boa da página (e robots.txt responde 5xx, que o Google trata como temporário).
export const getPublicSettings = cache(async (): Promise<PublicSettings> => {
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
})

// Anúncios ligados no painel (spec §10.2); em caso de erro, desligados
export async function getAdsEnabled(): Promise<boolean> {
  try {
    return (await getPublicSettings()).adsEnabled
  } catch {
    return false
  }
}

// E-mail que recebe o formulário de contato (campo restrito do painel: lido só no servidor)
export async function getContactEmail(): Promise<string | null> {
  try {
    const payload = await getSitePayload()
    const settings = await payload.findGlobal({ slug: 'site-settings', depth: 0 })
    return settings.contactEmail?.trim() || null
  } catch {
    return null
  }
}
