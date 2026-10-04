import type { TextFieldSingleValidation } from 'payload'

const MESSAGE = 'Informe uma URL completa começando com https://'

export function isHttpsUrl(value: unknown): boolean {
  if (typeof value !== 'string') return false
  try {
    return new URL(value).protocol === 'https:'
  } catch {
    return false
  }
}

export function httpsUrl(options: { optional?: boolean } = {}): TextFieldSingleValidation {
  return (value) => {
    if (options.optional && (value === null || value === undefined || String(value).trim() === '')) return true
    return isHttpsUrl(value) ? true : MESSAGE
  }
}
