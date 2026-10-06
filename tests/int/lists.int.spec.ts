import { afterAll, beforeAll, describe, expect, it } from 'vitest'

import { countBrandPublicItems, getPublicTaxonomy, listAnalyzedProducts, listContents } from '@/lib/data/lists'
import { setListsRevalidator, setRevalidator } from '@/lib/revalidate'
import { seedDemo } from '@/seed/demo'

import { createCategoryPair, Tracker, uid } from './helpers/fixtures'
import { getTestPayload } from './helpers/getTestPayload'

const payloadPromise = getTestPayload()
let tracker: Tracker
const paths: string[] = []
let listRevalidations = 0
const tags: string[] = []

beforeAll(async () => {
  const payload = await payloadPromise
  tracker = new Tracker(payload)
  await seedDemo(payload)
  setRevalidator((path) => {
    paths.push(path)
  })
  setListsRevalidator((tag) => {
    listRevalidations++
    tags.push(tag)
  })
})
afterAll(async () => {
  setRevalidator(null)
  setListsRevalidator(null)
  await tracker?.cleanup()
})

const idOf = async (collection: 'products' | 'brands', slug: string) => {
  const payload = await payloadPromise
  const { docs } = await payload.find({ collection, where: { slug: { equals: slug } }, limit: 1, depth: 0 })
  return docs[0].id
}

describe('Listas públicas', () => {
  it('taxonomia pública: Smart TVs aparece, Soundbars (sem conteúdo) não', async () => {
    const taxonomy = await getPublicTaxonomy()
    const tvs = taxonomy.find((category) => category.slug === 'tvs-e-entretenimento')
    expect(tvs).toBeDefined()
    const subSlugs = tvs!.subcategories.map((sub) => sub.slug)
    expect(subSlugs).toContain('smart-tvs')
    expect(subSlugs).not.toContain('soundbars')
    expect(tvs!.subcategories.find((sub) => sub.slug === 'smart-tvs')!.publicItems).toBeGreaterThan(0)
    // Categorias sem nenhuma subcategoria pública ficam de fora
    for (const category of taxonomy) expect(category.subcategories.length).toBeGreaterThan(0)
  })

  it('conteúdos por tipo, sem rascunho, com o link montado', async () => {
    const payload = await payloadPromise
    const { docs: subs } = await payload.find({ collection: 'categories', where: { slug: { equals: 'smart-tvs' } }, limit: 1 })
    const draft = tracker.add(
      'contents',
      await payload.create({
        collection: 'contents',
        data: { title: `Rascunho ${uid()}`, type: 'melhores', status: 'rascunho', primarySubcategory: subs[0].id } as never,
      }),
    )
    const result = await listContents({ type: 'melhores', page: 1 })
    const slugs = result.docs.map((doc) => doc.slug)
    expect(slugs).toContain('demo-melhores-tvs')
    expect(result.docs.map((doc) => doc.id)).not.toContain(draft.id)
    expect(result.docs.find((doc) => doc.slug === 'demo-melhores-tvs')!.href).toBe('/melhores/demo-melhores-tvs/')
    expect(result.page).toBe(1)
    expect(result.pages).toBeGreaterThanOrEqual(1)
  })

  it('conteúdos filtrados por subcategoria e por autor', async () => {
    const payload = await payloadPromise
    const { docs: subs } = await payload.find({ collection: 'categories', where: { slug: { equals: 'smart-tvs' } }, limit: 1 })
    const bySub = await listContents({ subcategoryIds: [subs[0].id], page: 1 })
    expect(bySub.docs.map((doc) => doc.slug)).toEqual(expect.arrayContaining(['demo-guia-como-escolher-tv', 'demo-entenda-oled-vs-qled']))

    const { docs: soundbars } = await payload.find({ collection: 'categories', where: { slug: { equals: 'soundbars' } }, limit: 1 })
    expect((await listContents({ subcategoryIds: [soundbars[0].id], page: 1 })).total).toBe(0)

    const { docs: authors } = await payload.find({ collection: 'authors', where: { slug: { equals: 'equipe-decicompra' } }, limit: 1 })
    const byAuthor = await listContents({ authorId: authors[0].id, page: 1 })
    expect(byAuthor.docs.map((doc) => doc.slug)).toEqual(
      expect.arrayContaining(['demo-melhores-tvs', 'demo-tv-alfa-vs-demo-tv-beta', 'demo-guia-como-escolher-tv', 'demo-entenda-oled-vs-qled']),
    )
  })

  it('produtos analisados: sem ficha nem rascunho', async () => {
    const result = await listAnalyzedProducts({ brandId: Number(await idOf('brands', 'demo-eletronicos')), page: 1 })
    const slugs = result.docs.map((doc) => doc.slug)
    expect(slugs).toEqual(expect.arrayContaining(['demo-tv-alfa', 'demo-tv-gama']))
    expect(slugs).not.toContain('demo-tv-beta')
  })

  it('itens públicos da marca: produtos em análise + conteúdos que citam produtos dela', async () => {
    const count = await countBrandPublicItems(Number(await idOf('brands', 'demo-eletronicos')))
    // Alfa e Gama em análise + comparativo, Melhores e guia
    expect(count).toBe(5)
  })
})

describe('Atualização das listas', () => {
  it('salvar um conteúdo limpa o cache das listas', async () => {
    const payload = await payloadPromise
    const { docs } = await payload.find({ collection: 'contents', where: { slug: { equals: 'demo-guia-como-escolher-tv' } }, limit: 1 })
    listRevalidations = 0
    await payload.update({ collection: 'contents', id: docs[0].id, data: { summary: docs[0].summary } })
    expect(listRevalidations).toBeGreaterThan(0)
  })

  it('subcategoria movida de categoria atualiza o caminho antigo (com o pai anterior)', async () => {
    const payload = await payloadPromise
    const { category, subcategory } = await createCategoryPair(payload, tracker)
    const other = tracker.add(
      'categories',
      await payload.create({ collection: 'categories', data: { name: `Outra ${uid()}`, slug: `outra-${uid()}` } }),
    )
    paths.length = 0
    await payload.update({ collection: 'categories', id: subcategory.id, data: { parent: other.id } })
    expect(paths).toEqual(expect.arrayContaining([`/${category.slug}/${subcategory.slug}/`, `/${other.slug}/${subcategory.slug}/`]))
  })

  it('a taxonomia (menu em todas as páginas) só é invalidada quando muda: preço de oferta não; status de produto sim', async () => {
    const payload = await payloadPromise
    const { docs: offers } = await payload.find({ collection: 'offers', where: { 'product.slug': { equals: 'demo-tv-alfa' } }, limit: 1 })
    tags.length = 0
    await payload.update({ collection: 'offers', id: offers[0].id, data: { verifiedAt: new Date().toISOString() } })
    expect(tags).toContain('listas')
    expect(tags).not.toContain('taxonomia')

    const { docs: products } = await payload.find({ collection: 'products', where: { slug: { equals: 'demo-tv-gama' } }, limit: 1 })
    tags.length = 0
    await payload.update({ collection: 'products', id: products[0].id, data: { status: 'ficha' } })
    try {
      expect(tags).toContain('taxonomia')
    } finally {
      await payload.update({ collection: 'products', id: products[0].id, data: { status: 'analise' } })
    }

    tags.length = 0
    await payload.update({ collection: 'products', id: products[0].id, data: { name: products[0].name } })
    expect(tags).not.toContain('taxonomia')
  })

  it('salvar uma categoria ou mudar o status de um conteúdo invalida a taxonomia', async () => {
    const payload = await payloadPromise
    const { docs: subs } = await payload.find({ collection: 'categories', where: { slug: { equals: 'soundbars' } }, limit: 1 })
    tags.length = 0
    await payload.update({ collection: 'categories', id: subs[0].id, data: { name: subs[0].name } })
    expect(tags).toContain('taxonomia')

    const { docs } = await payload.find({ collection: 'contents', where: { slug: { equals: 'demo-entenda-oled-vs-qled' } }, limit: 1 })
    tags.length = 0
    await payload.update({ collection: 'contents', id: docs[0].id, data: { summary: docs[0].summary } })
    expect(tags).not.toContain('taxonomia')
  })

  it('apagar uma marca ou um autor atualiza a página dele e as listas', async () => {
    const payload = await payloadPromise
    const brand = await payload.create({ collection: 'brands', data: { name: `Marca apagar ${uid()}` } })
    const author = await payload.create({ collection: 'authors', data: { name: `Autor apagar ${uid()}` } })
    paths.length = 0
    tags.length = 0
    await payload.delete({ collection: 'brands', id: brand.id })
    await payload.delete({ collection: 'authors', id: author.id })
    expect(paths).toEqual(expect.arrayContaining([`/marcas/${brand.slug}/`, '/marcas/', `/autores/${author.slug}/`]))
    expect(tags).toContain('listas')
  })
})
