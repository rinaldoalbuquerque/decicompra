import config from '@payload-config'
import { getPayload } from 'payload'

import { resolveNavigation } from '@/config/navigation'

// Menu e rodapé do painel; se o banco falhar, o site segue com o padrão
export async function getSiteNavigation() {
  try {
    const payload = await getPayload({ config })
    const settings = await payload.findGlobal({ slug: 'site-settings', depth: 0 })
    return resolveNavigation(settings)
  } catch (error) {
    console.error('[navegação] usando o menu padrão:', error)
    return resolveNavigation(null)
  }
}
