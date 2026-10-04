import { getSitePayload } from './payload'

// Anúncios ligados no painel (spec §10.2); em caso de erro, desligados
export async function getAdsEnabled(): Promise<boolean> {
  try {
    const payload = await getSitePayload()
    const settings = await payload.findGlobal({ slug: 'site-settings', depth: 0 })
    return Boolean(settings.adsEnabled)
  } catch {
    return false
  }
}
