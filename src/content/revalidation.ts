import { brandPath, CONTENT_PREFIX, contentPath, productPath, type ContentType } from './paths'

// Quais páginas geradas precisam ser refeitas quando algo muda (spec §5.6). A home entra sempre.

function unique(paths: (string | null | undefined)[]): string[] {
  return [...new Set(paths.filter((path): path is string => Boolean(path))), '/'].filter((path, i, all) => all.indexOf(path) === i)
}

export function pathsForProduct(input: {
  slug: string
  previousSlug?: string | null
  subcategoryPath?: string | null
  brandPath?: string | null
  contentPaths: string[]
}): string[] {
  return unique([
    productPath(input.slug),
    input.previousSlug && input.previousSlug !== input.slug ? productPath(input.previousSlug) : null,
    input.subcategoryPath,
    input.brandPath,
    ...input.contentPaths,
  ])
}

export function pathsForContent(input: {
  type: ContentType
  slug: string
  previous?: { type: ContentType; slug: string } | null
  subcategoryPath?: string | null
}): string[] {
  const previousPath = input.previous ? contentPath(input.previous.type, input.previous.slug) : null
  return unique([
    contentPath(input.type, input.slug),
    previousPath !== contentPath(input.type, input.slug) ? previousPath : null,
    CONTENT_PREFIX[input.type],
    input.previous ? CONTENT_PREFIX[input.previous.type] : null,
    input.subcategoryPath,
  ])
}

export function pathsForCategory(input: { path: string; previousPath?: string | null; parentPath?: string | null }): string[] {
  return unique([input.path, input.previousPath !== input.path ? input.previousPath : null, input.parentPath, '/categorias/'])
}

export function pathsForBrand(input: { slug: string; previousSlug?: string | null }): string[] {
  return unique([
    brandPath(input.slug),
    input.previousSlug && input.previousSlug !== input.slug ? brandPath(input.previousSlug) : null,
    '/marcas/',
  ])
}
