import { getPublicSettings } from '@/lib/data/settings'

export const revalidate = 3600

// ads.txt do AdSense (spec §10.2), editado nas Configurações do site
export async function GET() {
  const { adsTxt } = await getPublicSettings()
  return new Response(adsTxt ? `${adsTxt.trim()}\n` : '', { headers: { 'Content-Type': 'text/plain; charset=utf-8' } })
}
