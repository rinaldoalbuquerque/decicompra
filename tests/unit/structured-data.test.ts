import { describe, expect, it } from 'vitest'

import { articleLd, breadcrumbLd, itemListLd, jsonLdString, productReviewLd, siteLd } from '@/content/structured-data'

const SITE = 'https://x.com'

describe('dados estruturados (JSON-LD)', () => {
  it('Organization + WebSite com SearchAction para a busca', () => {
    const [organization, website] = siteLd(SITE)
    expect(organization).toMatchObject({ '@type': 'Organization', name: 'DeciCompra', url: `${SITE}/` })
    expect(website).toMatchObject({
      '@type': 'WebSite',
      url: `${SITE}/`,
      potentialAction: { '@type': 'SearchAction', target: `${SITE}/busca/?q={search_term_string}`, 'query-input': 'required name=search_term_string' },
    })
  })

  it('BreadcrumbList com posições e endereços absolutos; o item atual sem link', () => {
    const ld = breadcrumbLd([{ label: 'Início', href: '/' }, { label: 'Smart TVs', href: '/tvs/smart-tvs/' }, { label: 'LG C4' }], SITE)
    expect(ld).toEqual({
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Início', item: `${SITE}/` },
        { '@type': 'ListItem', position: 2, name: 'Smart TVs', item: `${SITE}/tvs/smart-tvs/` },
        { '@type': 'ListItem', position: 3, name: 'LG C4' },
      ],
    })
  })

  it('Product + Review com a nota DeciCompra (0 a 10) e autor organização', () => {
    const ld = productReviewLd({
      name: 'LG C4',
      url: '/produtos/lg-c4/',
      image: '/img.webp',
      brand: 'LG',
      score: 8.7,
      verdict: 'Ótima imagem.',
      reviewedAt: '2026-10-01T12:00:00.000Z',
      siteUrl: SITE,
    })
    expect(ld).toMatchObject({
      '@type': 'Product',
      name: 'LG C4',
      url: `${SITE}/produtos/lg-c4/`,
      image: `${SITE}/img.webp`,
      brand: { '@type': 'Brand', name: 'LG' },
      review: {
        '@type': 'Review',
        reviewRating: { '@type': 'Rating', ratingValue: 8.7, bestRating: 10, worstRating: 0 },
        author: { '@type': 'Organization', name: 'DeciCompra' },
        reviewBody: 'Ótima imagem.',
        datePublished: '2026-10-01T12:00:00.000Z',
      },
    })
  })

  it('ItemList (Melhores) e Article (guia, entenda, comparativo)', () => {
    expect(itemListLd([{ name: 'A', url: '/produtos/a/' }, { name: 'B', url: '/produtos/b/' }], SITE).itemListElement).toEqual([
      { '@type': 'ListItem', position: 1, name: 'A', url: `${SITE}/produtos/a/` },
      { '@type': 'ListItem', position: 2, name: 'B', url: `${SITE}/produtos/b/` },
    ])
    expect(articleLd({ headline: 'Guia', url: '/guias/x/', description: 'Resumo', datePublished: '2026-01-01', dateModified: null, siteUrl: SITE })).toMatchObject({
      '@type': 'Article',
      headline: 'Guia',
      mainEntityOfPage: `${SITE}/guias/x/`,
      author: { '@type': 'Organization', name: 'DeciCompra' },
      publisher: { '@type': 'Organization', name: 'DeciCompra' },
      datePublished: '2026-01-01',
      dateModified: '2026-01-01',
    })
  })

  it('serialização escapa "<" para não fechar o script', () => {
    expect(jsonLdString({ name: '</script><script>alert(1)</script>' })).not.toContain('</script>')
    expect(jsonLdString({ name: '<b>' })).toBe('{"name":"\\u003cb>"}')
  })
})
