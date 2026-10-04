import { ValidationError } from 'payload'
import type { CollectionAfterChangeHook, CollectionBeforeChangeHook, PayloadRequest } from 'payload'

import { roleOf } from '../../access'
import { comparisonSlug, productSetKey } from '../../content/comparison'
import { contentPath, type ContentType } from '../../content/paths'
import {
  checkContentPublication,
  extractProductIds,
  PUBLIC_STATUSES,
  removeProductFromContent,
  type ContentStatus,
} from '../../content/rules'
import { withContext } from '../../lib/hook-context'
import { pick, relId } from '../../lib/relations'
import { DEFAULT_AUTHOR } from '../../seed/authors'
import { applySlugRedirect } from '../redirects/apply'

const SPONSOR_TYPES: ContentType[] = ['guia', 'entenda']

const count = (value: unknown) => (Array.isArray(value) ? value.length : 0)

export const prepareContent: CollectionBeforeChangeHook = async ({ data, originalDoc, operation, req, context }) => {
  const errors: { path: string; message: string }[] = []
  const get = <T>(key: string) => pick<T>(data, originalDoc, key)
  const type = get<ContentType>('type') ?? 'guia'
  const status = get<ContentStatus>('status') ?? 'rascunho'
  // Na criação o Payload também passa originalDoc (sem id)
  const existingId = operation === 'update' ? relId(originalDoc?.id) : null
  // Limpeza ao apagar um produto: nunca falha; o que deixaria de valer vai para revisão
  const cleanup = Boolean(context.productCleanup)
  let needsReview = false

  if (type === 'comparativo') {
    const ids = (get<unknown[]>('comparedProducts') ?? []).map(relId).filter((id): id is number | string => id !== null)
    if (ids.length > 3) errors.push({ path: 'comparedProducts', message: 'Um comparativo precisa de 2 ou 3 produtos.' })
    if (ids.length >= 2 && ids.length <= 3) {
      const { docs: products } = await req.payload.find({
        collection: 'products',
        where: { id: { in: ids } },
        depth: 0,
        limit: 3,
        req,
      })
      const subcategories = new Set(products.map((product) => String(relId(product.subcategory))))
      if (subcategories.size > 1) {
        errors.push({ path: 'comparedProducts', message: 'Os produtos de um comparativo precisam ser da mesma subcategoria.' })
      } else {
        data.primarySubcategory = relId(products[0]?.subcategory)
        data.slug = comparisonSlug(products.map((product) => product.slug ?? String(product.id)))
        data.productSetKey = productSetKey(ids.map(Number))
        const duplicates = await req.payload.count({
          collection: 'contents',
          where: {
            and: [
              { productSetKey: { equals: data.productSetKey } },
              ...(existingId !== null ? [{ id: { not_equals: existingId } }] : []),
            ],
          },
          req,
        })
        if (duplicates.totalDocs > 0) {
          if (cleanup) {
            // Mantém o endereço atual (o canônico já pertence ao outro comparativo) e manda para revisão
            data.slug = originalDoc?.slug
            data.productSetKey = null
            needsReview = true
          } else {
            errors.push({ path: 'comparedProducts', message: 'Já existe um comparativo com estes produtos.' })
          }
        }
      }
    } else {
      data.productSetKey = null
    }
  } else {
    data.productSetKey = null
    if (relId(get('primarySubcategory')) === null) {
      errors.push({ path: 'primarySubcategory', message: 'Escolha a subcategoria principal.' })
    }
  }

  if (get<boolean>('sponsored') && !SPONSOR_TYPES.includes(type)) {
    errors.push({ path: 'sponsored', message: 'Conteúdo patrocinado só é permitido em Guia e Entenda.' })
  }
  if (roleOf(req.user) === 'redator' && PUBLIC_STATUSES.includes(status)) {
    errors.push({ path: 'status', message: 'Redatores só podem salvar como rascunho ou em revisão.' })
  }

  const publishAt = get<string | null>('publishAt')
  if (status === 'publicado' && !publishAt) data.publishAt = new Date().toISOString()
  // Data futura só é exigida ao agendar (mudança de status ou de data), não em toda edição
  const time = (value: unknown) => (value ? new Date(String(value)).getTime() : null)
  const scheduling = status === 'agendado' && (originalDoc?.status !== 'agendado' || time(publishAt) !== time(originalDoc?.publishAt))
  if (scheduling && !context.skipPublicationCheck && (!publishAt || new Date(publishAt).getTime() <= Date.now())) {
    errors.push({ path: 'publishAt', message: 'Para agendar, informe uma data de publicação no futuro.' })
  }

  if (relId(get('author')) === null) {
    const { docs } = await req.payload.find({
      collection: 'authors',
      where: { slug: { equals: DEFAULT_AUTHOR.slug } },
      depth: 0,
      limit: 1,
      req,
    })
    if (docs[0]) data.author = docs[0].id
  }

  data.referencedProducts = extractProductIds({
    body: get('body'),
    picks: get('picks'),
    alsoConsidered: get('alsoConsidered'),
    comparedProducts: get('comparedProducts'),
    badges: get('badges'),
    chooseIf: get('chooseIf'),
    specOverrides: get('specOverrides'),
  })

  if (!context.skipPublicationCheck || cleanup) {
    const seo = get<{ metaDescription?: string | null }>('seo')
    const missing = checkContentPublication({
        type,
        status,
        summary: get<string>('summary'),
        metaDescription: seo?.metaDescription,
        sourcesCount: count(get('sources')),
        reviewedAt: get<string>('reviewedAt'),
        picksCount: count(get('picks')),
        comparedCount: count(get('comparedProducts')),
    })
    if (cleanup) needsReview ||= missing.length > 0
    else errors.push(...missing.map((message) => ({ path: 'status', message })))
  }

  if (needsReview && PUBLIC_STATUSES.includes(status)) data.status = 'em_revisao'

  if (errors.length > 0) throw new ValidationError({ collection: 'contents', errors })
  return data
}

// Endereço público mudou: o antigo passa a redirecionar (spec §3.2)
export const redirectContentSlug: CollectionAfterChangeHook = async ({ doc, previousDoc, operation, req }) => {
  if (operation !== 'update' || !previousDoc?.slug || !PUBLIC_STATUSES.includes(previousDoc.status)) return doc
  const from = contentPath(previousDoc.type, previousDoc.slug)
  const to = contentPath(doc.type, doc.slug)
  if (from !== to) await applySlugRedirect(req, from, to)
  return doc
}

// Antes de apagar um produto: tira as referências a ele dos conteúdos, que continuam salváveis
export async function detachProductFromContents(req: PayloadRequest, productId: number | string): Promise<void> {
  const { docs } = await req.payload.find({
    collection: 'contents',
    where: { referencedProducts: { in: [productId] } },
    depth: 0,
    limit: 10_000,
    req,
  })
  for (const content of docs) {
    const cleaned = removeProductFromContent(
      {
        body: content.body,
        picks: content.picks,
        alsoConsidered: content.alsoConsidered,
        comparedProducts: content.comparedProducts,
        badges: content.badges,
        chooseIf: content.chooseIf,
        specOverrides: content.specOverrides,
      },
      Number(productId),
    )
    await withContext(req, { skipPublicationCheck: true, productCleanup: true }, () =>
      req.payload.update({ collection: 'contents', id: content.id, data: cleaned as never, req }),
    )
  }
}

// Slug de produto mudou: comparativos que o citam recalculam o endereço canônico (e o redirecionamento)
export async function refreshComparisonsOf(req: PayloadRequest, productId: number | string): Promise<void> {
  const { docs } = await req.payload.find({
    collection: 'contents',
    where: { and: [{ type: { equals: 'comparativo' } }, { comparedProducts: { in: [productId] } }] },
    depth: 0,
    limit: 10_000,
    req,
  })
  for (const content of docs) {
    await withContext(req, { skipPublicationCheck: true }, () =>
      req.payload.update({ collection: 'contents', id: content.id, data: {}, req }),
    )
  }
}
