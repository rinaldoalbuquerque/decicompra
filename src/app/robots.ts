import type { MetadataRoute } from 'next'

import { robotsRules } from '@/content/seo'
import { getPublicSettings } from '@/lib/data/settings'
import { siteUrl } from '@/lib/site-url'

export const revalidate = 3600

// robots.txt (spec §11): antes do lançamento bloqueia tudo; depois, só /ir/, painel, API e busca
export default async function robots(): Promise<MetadataRoute.Robots> {
  const { indexingEnabled } = await getPublicSettings()
  return robotsRules({ indexingEnabled, siteUrl: siteUrl() })
}
