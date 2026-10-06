import { APIError, ValidationError } from 'payload'
import type { CollectionAfterChangeHook, CollectionBeforeChangeHook, CollectionBeforeDeleteHook } from 'payload'

import { validateCriteria, type Criterion } from '../../catalog/score'
import { validateSpecTemplate, type SpecAttribute } from '../../catalog/spec-template'
import { categoryPath } from '../../content/paths'
import { withContext } from '../../lib/hook-context'
import { pick, relId } from '../../lib/relations'
import { applySlugRedirect } from '../redirects/apply'

// Primeiro segmento de endereços fixos do site: uma categoria de 1º nível (/{slug}/) não pode usá-los
export const RESERVED_TOP_LEVEL_SLUGS = [
  'produtos', 'melhores', 'comparar', 'guias', 'entenda', 'marcas', 'autores', 'categorias', 'busca', 'ir', 'admin', 'api',
  'sobre', 'contato', 'como-avaliamos', 'politica-editorial', 'divulgacao-de-afiliados', 'publicidade-e-transparencia',
  'privacidade', 'cookies', 'termos', '_next',
]

export const validateCategory: CollectionBeforeChangeHook = async ({ data, originalDoc, operation, req }) => {
  const errors: { message: string; path: string }[] = []
  const slug = pick(data, originalDoc, 'slug')
  if (relId(pick(data, originalDoc, 'parent')) === null && typeof slug === 'string' && RESERVED_TOP_LEVEL_SLUGS.includes(slug)) {
    throw new ValidationError({
      collection: 'categories',
      errors: [{ path: 'slug', message: 'Este endereço é usado pelo site; escolha outro nome.' }],
    })
  }
  // Na criação o Payload também passa originalDoc (sem id); só a edição tem um documento existente
  const existingId = operation === 'update' ? relId(originalDoc?.id) : null
  const parentId = relId(pick(data, originalDoc, 'parent'))

  if (parentId === null && existingId !== null && relId(originalDoc?.parent) !== null) {
    const products = await req.payload.count({ collection: 'products', where: { subcategory: { equals: existingId } }, req })
    if (products.totalDocs > 0) {
      throw new ValidationError({
        collection: 'categories',
        errors: [{ path: 'parent', message: 'Esta subcategoria tem produtos e não pode virar categoria de 1º nível.' }],
      })
    }
  }

  if (parentId === null) {
    // Categoria de 1º nível: modelo, critérios e âncora só existem em subcategorias
    data.specTemplate = []
    data.criteria = []
    data.isAnchor = false
    return data
  }

  if (existingId !== null && String(parentId) === String(existingId)) {
    errors.push({ path: 'parent', message: 'Uma categoria não pode ser mãe de si mesma.' })
  } else {
    const parent = await req.payload.findByID({ collection: 'categories', id: parentId, depth: 0, req })
    if (relId(parent.parent) !== null) {
      errors.push({ path: 'parent', message: 'A categoria-mãe precisa ser de 1º nível (só existem 2 níveis).' })
    }
  }

  if (existingId !== null) {
    const children = await req.payload.count({ collection: 'categories', where: { parent: { equals: existingId } }, req })
    if (children.totalDocs > 0) {
      errors.push({ path: 'parent', message: 'Esta categoria tem subcategorias e não pode virar subcategoria.' })
    }
  }

  const template = (pick<SpecAttribute[]>(data, originalDoc, 'specTemplate') ?? []) as SpecAttribute[]
  const criteria = (pick<Criterion[]>(data, originalDoc, 'criteria') ?? []) as Criterion[]
  errors.push(...validateSpecTemplate(template).map((message) => ({ path: 'specTemplate', message })))
  errors.push(...validateCriteria(criteria).map((message) => ({ path: 'criteria', message })))

  if (errors.length > 0) throw new ValidationError({ collection: 'categories', errors })
  return data
}

export const guardCategoryDelete: CollectionBeforeDeleteHook = async ({ id, req }) => {
  const [children, products] = await Promise.all([
    req.payload.count({ collection: 'categories', where: { parent: { equals: id } }, req }),
    req.payload.count({ collection: 'products', where: { subcategory: { equals: id } }, req }),
  ])
  if (children.totalDocs > 0 || products.totalDocs > 0) {
    throw new APIError('Não é possível apagar: existem subcategorias ou produtos ligados a esta categoria.', 409, undefined, true)
  }
}

function rulesSignature(doc: Record<string, unknown> | undefined): string {
  const strip = (rows: unknown) =>
    Array.isArray(rows) ? rows.map(({ id: _id, ...rest }: Record<string, unknown>) => rest) : []
  return JSON.stringify({ template: strip(doc?.specTemplate), criteria: strip(doc?.criteria) })
}

// Produtos e variantes acompanham o modelo e os critérios da subcategoria
export const resyncSubcategoryProducts: CollectionAfterChangeHook = async ({ doc, previousDoc, operation, req }) => {
  if (operation !== 'update' || relId(doc.parent) === null) return doc
  if (rulesSignature(doc) === rulesSignature(previousDoc)) return doc

  const products = await req.payload.find({
    collection: 'products',
    where: { subcategory: { equals: doc.id } },
    depth: 0,
    limit: 10_000,
    req,
  })
  for (const product of products.docs) {
    await withContext(req, { skipPublicationCheck: true }, () =>
      req.payload.update({ collection: 'products', id: product.id, data: {}, req }),
    )
    const variants = await req.payload.find({ collection: 'variants', where: { product: { equals: product.id } }, depth: 0, limit: 1000, req })
    for (const variant of variants.docs) {
      await withContext(req, { skipPublicationCheck: true }, () =>
        req.payload.update({ collection: 'variants', id: variant.id, data: {}, req }),
      )
    }
  }
  return doc
}

// Endereços públicos de categorias e subcategorias acompanham a mudança de slug (spec §3.2)
export const redirectCategorySlug: CollectionAfterChangeHook = async ({ doc, previousDoc, operation, req }) => {
  if (operation !== 'update' || !previousDoc?.slug || previousDoc.slug === doc.slug || !previousDoc.active) return doc
  const parentId = relId(doc.parent)
  if (parentId !== null) {
    const parent = await req.payload.findByID({ collection: 'categories', id: parentId, depth: 0, req })
    await applySlugRedirect(req, categoryPath(previousDoc.slug, parent.slug), categoryPath(doc.slug, parent.slug))
    return doc
  }
  await applySlugRedirect(req, categoryPath(previousDoc.slug), categoryPath(doc.slug))
  const children = await req.payload.find({ collection: 'categories', where: { parent: { equals: doc.id } }, depth: 0, limit: 1000, req })
  for (const child of children.docs) {
    if (!child.slug) continue
    await applySlugRedirect(req, categoryPath(child.slug, previousDoc.slug), categoryPath(child.slug, doc.slug))
  }
  return doc
}
