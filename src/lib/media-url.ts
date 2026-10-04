// URL pública de um arquivo no R2: <publicUrl>/<prefixo>/<arquivo>, com cada trecho codificado
export function buildMediaURL(publicUrl: string, prefix: string | undefined, filename: string): string {
  const base = publicUrl.replace(/\/+$/, '')
  const segments = [...(prefix ? prefix.split('/') : []), filename]
    .filter((segment) => segment.length > 0)
    .map(encodeURIComponent)
  return `${base}/${segments.join('/')}`
}
