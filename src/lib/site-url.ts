type EnvSource = Record<string, string | undefined>

const LOCAL = 'http://localhost:3000'

function validOrigin(value: string | undefined): string | null {
  if (!value?.trim()) return null
  try {
    const url = new URL(value.trim())
    return url.protocol === 'https:' || url.protocol === 'http:' ? url.origin : null
  } catch {
    return null
  }
}

// Endereço público do site (canônicos, sitemap, dados estruturados). No lançamento, defina
// NEXT_PUBLIC_SITE_URL com o domínio (ex.: https://www.decicompra.com.br).
export function siteUrl(env: EnvSource = process.env): string {
  return (
    validOrigin(env.NEXT_PUBLIC_SITE_URL) ??
    (env.VERCEL_PROJECT_PRODUCTION_URL ? validOrigin(`https://${env.VERCEL_PROJECT_PRODUCTION_URL}`) : null) ??
    LOCAL
  )
}

export function absoluteUrl(path: string, env: EnvSource = process.env): string {
  if (/^https?:\/\//.test(path)) return path
  return `${siteUrl(env)}${path.startsWith('/') ? path : `/${path}`}`
}
