import { ValidationError } from 'payload'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

import { relId } from '@/lib/relations'
import { seedAuthors } from '@/seed/authors'

import { createBrand, createCategoryPair, createImage, createProduct, makePublishable, Tracker, uid } from './helpers/fixtures'
import { getTestPayload } from './helpers/getTestPayload'
import { getTestUsers } from './helpers/users'

const payloadPromise = getTestPayload()
let tracker: Tracker

beforeAll(async () => seedAuthors(await payloadPromise))
afterAll(async () => {
  const payload = await payloadPromise
  await payload.delete({ collection: 'redirects', where: { from: { like: '-teste-' } } }).catch(() => undefined)
  await tracker?.cleanup()
})

const SUMMARY = 'Um guia direto para escolher bem: o que observar, quanto pagar e quais armadilhas evitar na compra.'
const PUBLISH = {
  summary: SUMMARY,
  sources: [{ title: 'Fonte oficial', url: 'https://www.exemplo.com.br' }],
  reviewedAt: '2026-10-04T12:00:00.000Z',
}

function lexical(blocks: Record<string, unknown>[]) {
  return {
    root: {
      type: 'root',
      format: '',
      indent: 0,
      version: 1,
      direction: null,
      children: [
        {
          type: 'paragraph',
          format: '',
          indent: 0,
          version: 1,
          direction: null,
          textFormat: 0,
          textStyle: '',
          children: [{ type: 'text', text: 'Texto', format: 0, style: '', mode: 'normal', detail: 0, version: 1 }],
        },
        ...blocks.map((fields) => ({ type: 'block', format: '', version: 2, fields: { id: uid(), blockName: '', ...fields } })),
      ],
    },
  }
}

async function catalog(productCount: number) {
  const payload = await payloadPromise
  tracker ??= new Tracker(payload)
  const { subcategory } = await createCategoryPair(payload, tracker)
  const brand = await createBrand(payload, tracker)
  const products = []
  for (let i = 0; i < productCount; i++) {
    products.push(await createProduct(payload, tracker, { subcategoryId: subcategory.id, brandId: brand.id }))
  }
  return { payload, subcategory, brand, products }
}

async function createContent(data: Record<string, unknown>, options: { user?: unknown } = {}) {
  const payload = await payloadPromise
  const doc = await payload.create({
    collection: 'contents',
    data: { title: `Conteúdo ${uid()}`, type: 'guia', status: 'rascunho', ...data } as never,
    ...(options.user ? { user: options.user as never, overrideAccess: false } : {}),
  })
  return tracker.add('contents', doc)
}

const messages = (error: unknown) => JSON.stringify((error as ValidationError).data ?? (error as Error).message)

describe('Conteúdos', () => {
  it('comparativo: slug canônico em qualquer ordem, conjunto único e mesma subcategoria', async () => {
    const { payload, products, subcategory } = await catalog(2)
    const [a, b] = products
    const doc = await createContent({ type: 'comparativo', comparedProducts: [b.id, a.id] })
    expect(doc.slug).toBe([a.slug, b.slug].sort().join('-vs-'))
    expect(relId(doc.primarySubcategory)).toBe(subcategory.id)

    const repeated = await createContent({ type: 'comparativo', comparedProducts: [a.id, b.id] }).catch((e: unknown) => e)
    expect(messages(repeated)).toContain('Já existe um comparativo com estes produtos')

    const other = await catalog(1)
    const mixed = await createContent({ type: 'comparativo', comparedProducts: [a.id, other.products[0].id] }).catch((e: unknown) => e)
    expect(messages(mixed)).toContain('mesma subcategoria')
    expect(payload).toBeDefined()
  })

  it('Melhores: 2 escolhas não publica, 3 publica; referências vêm de escolhas e blocos', async () => {
    const { products, subcategory } = await catalog(4)
    const [p1, p2, p3, p4] = products
    const picks = (list: typeof products) => list.map((p, i) => ({ product: p.id, profileLabel: `Perfil ${i}`, position: i + 1 }))
    const two = await createContent({
      type: 'melhores',
      primarySubcategory: subcategory.id,
      picks: picks([p1, p2]),
      status: 'publicado',
      ...PUBLISH,
    }).catch((e: unknown) => e)
    expect(messages(two)).toContain('3 a 10 escolhas')

    const three = await createContent({
      type: 'melhores',
      primarySubcategory: subcategory.id,
      picks: picks([p1, p2, p3]),
      body: lexical([{ blockType: 'productCard', product: p4.id }]),
      status: 'publicado',
      ...PUBLISH,
    })
    expect(three.status).toBe('publicado')
    expect(three.publishAt).toBeTruthy()
    expect((three.referencedProducts ?? []).map(relId).sort()).toEqual([p1.id, p2.id, p3.id, p4.id].sort())
  })

  it('redator salva em revisão mas não publica; autor padrão é a Equipe DeciCompra', async () => {
    const { subcategory } = await catalog(0)
    const { redator } = await getTestUsers(await payloadPromise)
    const review = await createContent({ primarySubcategory: subcategory.id, status: 'em_revisao' }, { user: redator })
    expect(review.status).toBe('em_revisao')
    const author = await (await payloadPromise).findByID({ collection: 'authors', id: relId(review.author)! })
    expect(author.slug).toBe('equipe-decicompra')

    const publish = await createContent({ primarySubcategory: subcategory.id, status: 'publicado', ...PUBLISH }, { user: redator }).catch(
      (e: unknown) => e,
    )
    expect(messages(publish)).toContain('Redatores só podem salvar como rascunho ou em revisão')
  })

  it('agendado no futuro só aparece para o público depois da data', async () => {
    const { payload, subcategory } = await catalog(0)
    const future = new Date(Date.now() + 86_400_000).toISOString()
    const doc = await createContent({ primarySubcategory: subcategory.id, status: 'agendado', publishAt: future, ...PUBLISH })
    const hidden = await payload.find({ collection: 'contents', where: { id: { equals: doc.id } }, overrideAccess: false })
    expect(hidden.totalDocs).toBe(0)

    const pastError = await payload
      .update({ collection: 'contents', id: doc.id, data: { publishAt: new Date(Date.now() - 1000).toISOString() } })
      .catch((e: unknown) => e)
    expect(messages(pastError)).toContain('data de publicação no futuro')

    await payload.update({
      collection: 'contents',
      id: doc.id,
      data: { status: 'publicado', publishAt: new Date(Date.now() - 1000).toISOString() },
    })
    const visible = await payload.find({ collection: 'contents', where: { id: { equals: doc.id } }, overrideAccess: false })
    expect(visible.totalDocs).toBe(1)
  })

  it('patrocínio só em Guia e Entenda', async () => {
    const { subcategory } = await catalog(0)
    const error = await createContent({ type: 'melhores', primarySubcategory: subcategory.id, sponsored: true }).catch((e: unknown) => e)
    expect(messages(error)).toContain('só é permitido em Guia e Entenda')
  })

  it('apagar um produto citado limpa o conteúdo, que continua salvável', async () => {
    const { payload, products, subcategory } = await catalog(4)
    const [p1, p2, p3, p4] = products
    const doc = await createContent({
      type: 'melhores',
      primarySubcategory: subcategory.id,
      picks: [p1, p2, p3].map((p, i) => ({ product: p.id, profileLabel: `P${i}`, position: i + 1 })),
      body: lexical([{ blockType: 'productCard', product: p4.id }, { blockType: 'tip', kind: 'dica', text: 'Dica' }]),
    })
    await payload.delete({ collection: 'products', id: p4.id })
    await payload.delete({ collection: 'products', id: p3.id })

    const after = await payload.findByID({ collection: 'contents', id: doc.id })
    expect((after.picks ?? []).map((p) => relId(p.product))).toEqual([p1.id, p2.id])
    expect((after.referencedProducts ?? []).map(relId).sort()).toEqual([p1.id, p2.id].sort())
    const renamed = await payload.update({ collection: 'contents', id: doc.id, data: { title: 'Novo título' } })
    expect(renamed.title).toBe('Novo título')
  })

  it('mudar o slug de um conteúdo publicado cria o redirecionamento', async () => {
    const { payload, subcategory } = await catalog(0)
    const id = uid()
    const doc = await createContent({ primarySubcategory: subcategory.id, slug: `guia-a-teste-${id}`, status: 'publicado', ...PUBLISH })
    await payload.update({ collection: 'contents', id: doc.id, data: { slug: `guia-b-teste-${id}` } })
    const { docs } = await payload.find({ collection: 'redirects', where: { from: { equals: `/guias/guia-a-teste-${id}/` } } })
    expect(docs[0]?.to).toBe(`/guias/guia-b-teste-${id}/`)
  })

  it('usa o produto publicado nas fábricas (sanidade)', async () => {
    const { payload, products } = await catalog(1)
    const image = await createImage(payload, tracker)
    const published = await makePublishable(payload, products[0].id, image.id)
    expect(published.status).toBe('ficha')
  })
})
