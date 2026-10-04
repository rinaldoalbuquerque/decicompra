import { describe, expect, it } from 'vitest'

import { buildMediaURL } from '@/lib/media-url'

describe('buildMediaURL', () => {
  it('junta URL pública, prefixo e nome do arquivo', () => {
    expect(buildMediaURL('https://pub-1.r2.dev', 'media', 'tv.webp')).toBe('https://pub-1.r2.dev/media/tv.webp')
  })

  it('ignora barras finais na URL pública', () => {
    expect(buildMediaURL('https://pub-1.r2.dev//', 'media', 'tv.webp')).toBe('https://pub-1.r2.dev/media/tv.webp')
  })

  it('codifica espaços e acentos no nome do arquivo', () => {
    expect(buildMediaURL('https://pub-1.r2.dev', 'media', 'tv lg ç.webp')).toBe(
      'https://pub-1.r2.dev/media/tv%20lg%20%C3%A7.webp',
    )
  })

  it('funciona sem prefixo', () => {
    expect(buildMediaURL('https://pub-1.r2.dev', undefined, 'tv.webp')).toBe('https://pub-1.r2.dev/tv.webp')
  })
})
