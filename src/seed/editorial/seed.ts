import type { Payload } from 'payload'

import { comparisonSlug } from '../../content/comparison'
import type { RichTextValue } from '../lexical'
import type { EditorialPack, PackContent, PackProduct } from './types'

type Ids = Map<string, number>

const rows = (values: Record<string, string>) => Object.entries(values).map(([key, value]) => ({ key, value }))

// Troca, nos blocos do texto, os produtos citados por slug (productSlug/productSlugs) pelos ids
function resolveBody(body: RichTextValue | undefined, products: Ids): RichTextValue | undefined {
  if (!body) return body
  const visit = (node: unknown): unknown => {
    if (Array.isArray(node)) return node.map(visit)
    if (!node || typeof node !== 'object') return node
    const copy: Record<string, unknown> = {}
    for (const [key, value] of Object.entries(node)) copy[key] = visit(value)
    const fields = copy.fields as Record<string, unknown> | undefined
    if (fields && Array.isArray(fields.productSlugs)) {
      fields.products = (fields.productSlugs as string[]).map((slug) => idOf(products, slug))
      delete fields.productSlugs
    }
    if (fields && typeof fields.productSlug === 'string') {
      fields.product = idOf(products, fields.productSlug)
      delete fields.productSlug
    }
    return copy
  }
  return visit(body) as RichTextValue
}

function idOf(products: Ids, slug: string): number {
  const id = products.get(slug)
  if (id === undefined) throw new Error(`Produto "${slug}" não encontrado para o conteúdo.`)
  return id
}

async function findBySlug(payload: Payload, collection: 'products' | 'contents' | 'brands', slug: string) {
  const { docs } = await payload.find({ collection, where: { slug: { equals: slug } }, limit: 1, depth: 0 })
  return docs[0] as { id: number } | undefined
}

async function createProduct(payload: Payload, pack: EditorialPack, product: PackProduct, subcategoryId: number, brandId: number) {
  const created = await payload.create({
    collection: 'products',
    data: { name: product.name, slug: product.slug, brand: brandId, subcategory: subcategoryId, status: 'rascunho' },
  })

  // O produto nasce com uma variante padrão: ela vira a primeira do pacote
  const { docs: existing } = await payload.find({ collection: 'variants', where: { product: { equals: created.id } }, limit: 1, depth: 0 })
  for (const [index, variant] of product.variants.entries()) {
    const data = {
      label: variant.label,
      voltage: variant.voltage,
      modelCode: variant.modelCode,
      specs: rows(variant.specs),
      ...(variant.isReference ? { isReference: true } : {}),
    }
    if (index === 0 && existing[0]) await payload.update({ collection: 'variants', id: existing[0].id, data })
    else await payload.create({ collection: 'variants', data: { ...data, product: created.id } })
  }

  await payload.update({ collection: 'products', id: created.id, data: { ...productData(pack, product), reviewedAt: new Date().toISOString() } })
  return created.id
}

function contentData(content: PackContent, products: Ids, subcategoryId: number) {
  return {
    type: content.type,
    title: content.title,
    ...(content.slug ? { slug: content.slug } : {}),
    status: 'em_revisao' as const,
    primarySubcategory: subcategoryId,
    summary: content.summary,
    seo: { metaDescription: content.metaDescription },
    body: resolveBody(content.body, products),
    sources: content.sources,
    reviewedAt: new Date().toISOString(),
    modelsAnalyzed: content.modelsAnalyzed,
    picks: content.picks?.map(({ productSlug, ...pick }) => ({ ...pick, product: idOf(products, productSlug) })),
    alsoConsidered: content.alsoConsidered?.map(({ productSlug, reason }) => ({ product: idOf(products, productSlug), reason })),
    comparedProducts: content.comparedProductSlugs?.map((slug) => idOf(products, slug)),
    badges: content.badges?.map(({ productSlug, label }) => ({ product: idOf(products, productSlug), label })),
    chooseIf: content.chooseIf?.map(({ productSlug, text }) => ({ product: idOf(products, productSlug), text })),
    conclusion: content.conclusion,
  }
}

// Carrega um pacote editorial: cria só o que ainda não existe (pelo slug), produtos como rascunho e
// conteúdos "em revisão". Nunca altera o que já existe, para não apagar edições feitas no painel.
export async function seedEditorialPack(payload: Payload, pack: EditorialPack): Promise<{ created: string[]; skipped: string[] }> {
  const created: string[] = []
  const skipped: string[] = []

  const { docs: subs } = await payload.find({ collection: 'categories', where: { slug: { equals: pack.subcategorySlug } }, limit: 1, depth: 0 })
  const subcategory = subs[0]
  if (!subcategory?.parent) throw new Error(`Subcategoria "${pack.subcategorySlug}" não encontrada (rode pnpm seed).`)
  const criteria = (subcategory.criteria ?? []).map((criterion) => criterion.key).sort()
  if (JSON.stringify(criteria) !== JSON.stringify([...pack.criteriaKeys].sort())) {
    throw new Error(`Os critérios de "${pack.subcategorySlug}" no painel (${criteria.join(', ')}) não são os do pacote.`)
  }
  if ((subcategory.specTemplate ?? []).length === 0) {
    await payload.update({ collection: 'categories', id: subcategory.id, data: { specTemplate: pack.specTemplate as never } })
    created.push(`especificacoes:${pack.subcategorySlug}`)
  }

  const brands = new Map<string, number>()
  for (const brand of pack.brands) {
    const found = await findBySlug(payload, 'brands', brand.slug)
    const doc = found ?? (await payload.create({ collection: 'brands', data: brand }))
    if (!found) created.push(`marca:${brand.slug}`)
    brands.set(brand.slug, doc.id)
  }

  const products: Ids = new Map()
  for (const product of pack.products) {
    const found = await findBySlug(payload, 'products', product.slug)
    if (found) {
      products.set(product.slug, found.id)
      skipped.push(`produto:${product.slug}`)
      continue
    }
    const brandId = brands.get(product.brandSlug)
    if (brandId === undefined) throw new Error(`Marca "${product.brandSlug}" não está no pacote.`)
    products.set(product.slug, await createProduct(payload, pack, product, subcategory.id, brandId))
    created.push(`produto:${product.slug}`)
  }

  for (const content of pack.contents) {
    const slug = content.slug ?? comparisonSlug(content.comparedProductSlugs ?? [])
    if (await findBySlug(payload, 'contents', slug)) {
      skipped.push(`conteudo:${slug}`)
      continue
    }
    await payload.create({ collection: 'contents', data: contentData(content, products, subcategory.id) as never })
    created.push(`conteudo:${slug}`)
  }

  return { created, skipped }
}

// Margem entre a criação e a última gravação feita pelo próprio carregamento (variantes, notas)
const UNTOUCHED_MS = 2 * 60 * 1000

const editedAfterSeeding = (doc: { createdAt: string; updatedAt: string }) =>
  new Date(doc.updatedAt).getTime() - new Date(doc.createdAt).getTime() > UNTOUCHED_MS

function productData(pack: EditorialPack, product: PackProduct) {
  const perVariant = new Set(pack.specTemplate.filter((attr) => attr.perVariant).map((attr) => attr.key))
  return {
    name: product.name,
    specs: rows(Object.fromEntries(Object.entries(product.specs).filter(([key]) => !perVariant.has(key)))),
    scores: Object.entries(product.scores).map(([key, { score, justification }]) => ({ key, score, justification })),
    verdict: product.verdict,
    pros: product.pros.map((text) => ({ text })),
    cons: product.cons.map((text) => ({ text })),
    recommendedFor: product.recommendedFor,
    avoidIf: product.avoidIf,
    fullReview: product.review,
    faq: product.faq,
    sources: product.sources,
  }
}

// Corrige documentos já carregados com os dados atuais do pacote, mas só os que ninguém editou depois
// do carregamento (os editados ficam como estão e aparecem no relatório). Status nunca é alterado.
export async function refreshFromPack(
  payload: Payload,
  pack: EditorialPack,
  options: { products?: string[]; contents?: string[]; renamedProducts?: Record<string, string> },
): Promise<{ updated: string[]; skipped: string[] }> {
  const updated: string[] = []
  const skipped: string[] = []

  // A troca de slug grava o documento: quem foi renomeado aqui já foi conferido antes da troca
  const renamedIds = new Set<number>()
  for (const [oldSlug, newSlug] of Object.entries(options.renamedProducts ?? {})) {
    const { docs } = await payload.find({ collection: 'products', where: { slug: { equals: oldSlug } }, limit: 1, depth: 0 })
    if (!docs[0]) continue
    if (editedAfterSeeding(docs[0])) {
      skipped.push(`produto:${oldSlug} (editado depois do carregamento)`)
      continue
    }
    await payload.update({ collection: 'products', id: docs[0].id, data: { slug: newSlug } })
    renamedIds.add(docs[0].id)
  }

  const products: Ids = new Map()
  for (const product of pack.products) {
    const found = await findBySlug(payload, 'products', product.slug)
    if (found) products.set(product.slug, found.id)
  }

  for (const slug of options.products ?? []) {
    const product = pack.products.find((item) => item.slug === slug)
    const id = products.get(slug)
    if (!product || id === undefined) continue
    const doc = await payload.findByID({ collection: 'products', id, depth: 0 })
    if (!renamedIds.has(id) && editedAfterSeeding(doc)) {
      skipped.push(`produto:${slug} (editado depois do carregamento)`)
      continue
    }
    const { docs: variants } = await payload.find({ collection: 'variants', where: { product: { equals: id } }, sort: 'createdAt', depth: 0, limit: 100 })
    for (const [index, variant] of product.variants.entries()) {
      const target = variants.find((item) => item.label === variant.label) ?? variants[index]
      if (target) {
        await payload.update({ collection: 'variants', id: target.id, data: { label: variant.label, voltage: variant.voltage, modelCode: variant.modelCode, specs: rows(variant.specs) } })
      }
    }
    await payload.update({ collection: 'products', id, data: productData(pack, product) })
    updated.push(`produto:${slug}`)
  }

  const { docs: subs } = await payload.find({ collection: 'categories', where: { slug: { equals: pack.subcategorySlug } }, limit: 1, depth: 0 })
  for (const slug of options.contents ?? []) {
    const content = pack.contents.find((item) => (item.slug ?? comparisonSlug(item.comparedProductSlugs ?? [])) === slug)
    const { docs } = await payload.find({ collection: 'contents', where: { slug: { equals: slug } }, limit: 1, depth: 0 })
    if (!content || !docs[0] || !subs[0]) continue
    if (editedAfterSeeding(docs[0])) {
      skipped.push(`conteudo:${slug} (editado depois do carregamento)`)
      continue
    }
    const { status: _status, slug: _slug, ...data } = contentData(content, products, subs[0].id)
    await payload.update({ collection: 'contents', id: docs[0].id, data: data as never })
    updated.push(`conteudo:${slug}`)
  }

  return { updated, skipped }
}
