import { describe, expect, it } from 'vitest'

import { robotsMetadata, robotsRules } from '@/content/seo'
import { absoluteUrl, siteUrl } from '@/lib/site-url'

describe('endereço do site', () => {
  it('usa NEXT_PUBLIC_SITE_URL sem barra final', () => {
    expect(siteUrl({ NEXT_PUBLIC_SITE_URL: 'https://www.decicompra.com.br/' })).toBe('https://www.decicompra.com.br')
  })

  it('na Vercel sem domínio configurado usa o endereço de produção do projeto', () => {
    expect(siteUrl({ VERCEL_PROJECT_PRODUCTION_URL: 'decicompra.vercel.app' })).toBe('https://decicompra.vercel.app')
  })

  it('local usa localhost:3000; valor inválido é ignorado', () => {
    expect(siteUrl({})).toBe('http://localhost:3000')
    expect(siteUrl({ NEXT_PUBLIC_SITE_URL: 'nao é url' })).toBe('http://localhost:3000')
  })

  it('monta endereços absolutos', () => {
    expect(absoluteUrl('/produtos/lg-c4/', { NEXT_PUBLIC_SITE_URL: 'https://decicompra.com.br' })).toBe('https://decicompra.com.br/produtos/lg-c4/')
    expect(absoluteUrl('https://outro.com/x', {})).toBe('https://outro.com/x')
  })
})

describe('indexação do site (chave de lançamento)', () => {
  it('antes do lançamento: noindex, nofollow e robots.txt bloqueando tudo', () => {
    expect(robotsMetadata(false)).toEqual({ index: false, follow: false })
    const rules = robotsRules({ indexingEnabled: false, siteUrl: 'https://x.com' })
    expect(rules.rules).toEqual({ userAgent: '*', disallow: '/' })
    expect(rules.sitemap).toBeUndefined()
  })

  it('depois do lançamento: index, follow; robots.txt bloqueia só /ir/, painel, api e busca e aponta o sitemap', () => {
    expect(robotsMetadata(true)).toEqual({ index: true, follow: true })
    const rules = robotsRules({ indexingEnabled: true, siteUrl: 'https://x.com' })
    expect(rules.rules).toEqual({ userAgent: '*', allow: '/', disallow: ['/ir/', '/admin', '/api/', '/busca/'] })
    expect(rules.sitemap).toBe('https://x.com/sitemap.xml')
  })
})
