// Dados estruturados (spec §11). Sem FAQ estruturado (fora da v1). O autor é sempre a organização.

const CONTEXT = 'https://schema.org'
const ORGANIZATION = { '@type': 'Organization', name: 'DeciCompra' } as const

const absolute = (path: string, siteUrl: string) => (/^https?:\/\//.test(path) ? path : `${siteUrl}${path.startsWith('/') ? path : `/${path}`}`)

// Texto dentro de <script>: "<" vira < para o conteúdo nunca fechar a tag
export function jsonLdString(data: unknown): string {
  return JSON.stringify(data).replace(/</g, '\\u003c')
}

export function siteLd(siteUrl: string) {
  return [
    { '@context': CONTEXT, ...ORGANIZATION, url: `${siteUrl}/` },
    {
      '@context': CONTEXT,
      '@type': 'WebSite',
      name: 'DeciCompra',
      url: `${siteUrl}/`,
      inLanguage: 'pt-BR',
      potentialAction: {
        '@type': 'SearchAction',
        target: `${siteUrl}/busca/?q={search_term_string}`,
        'query-input': 'required name=search_term_string',
      },
    },
  ]
}

export function breadcrumbLd(items: { label: string; href?: string }[], siteUrl: string) {
  return {
    '@context': CONTEXT,
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.label,
      ...(item.href ? { item: absolute(item.href, siteUrl) } : {}),
    })),
  }
}

// Produto em análise com a Nota DeciCompra (0–10)
export function productReviewLd(input: {
  name: string
  url: string
  image?: string | null
  brand?: string | null
  score: number
  verdict?: string | null
  reviewedAt?: string | null
  siteUrl: string
}) {
  return {
    '@context': CONTEXT,
    '@type': 'Product',
    name: input.name,
    url: absolute(input.url, input.siteUrl),
    ...(input.image ? { image: absolute(input.image, input.siteUrl) } : {}),
    ...(input.brand ? { brand: { '@type': 'Brand', name: input.brand } } : {}),
    review: {
      '@type': 'Review',
      reviewRating: { '@type': 'Rating', ratingValue: input.score, bestRating: 10, worstRating: 0 },
      author: ORGANIZATION,
      ...(input.verdict ? { reviewBody: input.verdict } : {}),
      ...(input.reviewedAt ? { datePublished: input.reviewedAt } : {}),
    },
  }
}

export function itemListLd(items: { name: string; url: string }[], siteUrl: string) {
  return {
    '@context': CONTEXT,
    '@type': 'ItemList',
    itemListElement: items.map((item, index) => ({ '@type': 'ListItem', position: index + 1, name: item.name, url: absolute(item.url, siteUrl) })),
  }
}

export function articleLd(input: {
  headline: string
  url: string
  description?: string | null
  image?: string | null
  datePublished?: string | null
  dateModified?: string | null
  siteUrl: string
}) {
  const published = input.datePublished ?? input.dateModified ?? undefined
  return {
    '@context': CONTEXT,
    '@type': 'Article',
    headline: input.headline,
    mainEntityOfPage: absolute(input.url, input.siteUrl),
    ...(input.description ? { description: input.description } : {}),
    ...(input.image ? { image: absolute(input.image, input.siteUrl) } : {}),
    author: ORGANIZATION,
    publisher: ORGANIZATION,
    ...(published ? { datePublished: published, dateModified: input.dateModified ?? published } : {}),
    inLanguage: 'pt-BR',
  }
}
