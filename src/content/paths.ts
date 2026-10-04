// Endereços públicos do site (spec §3.2)
export type ContentType = 'melhores' | 'comparativo' | 'guia' | 'entenda'

export const CONTENT_PREFIX: Record<ContentType, string> = {
  melhores: '/melhores/',
  comparativo: '/comparar/',
  guia: '/guias/',
  entenda: '/entenda/',
}

export const productPath = (slug: string) => `/produtos/${slug}/`

export const brandPath = (slug: string) => `/marcas/${slug}/`

export const categoryPath = (slug: string, parentSlug?: string | null) =>
  parentSlug ? `/${parentSlug}/${slug}/` : `/${slug}/`

export const contentPath = (type: ContentType, slug: string) => `${CONTENT_PREFIX[type]}${slug}/`
