import { afterAll, describe, expect, it } from 'vitest'

import { createBrand, createCategoryPair, createImage, createProduct, makePublishable, Tracker, uid } from './helpers/fixtures'
import { getTestPayload } from './helpers/getTestPayload'

const payloadPromise = getTestPayload()
let tracker: Tracker

afterAll(async () => {
  const payload = await payloadPromise
  await payload
    .delete({ collection: 'redirects', where: { or: [{ from: { like: '-teste-' } }, { to: { like: '-teste-' } }] } })
    .catch(() => undefined)
  await tracker?.cleanup()
})

async function redirectsFrom(from: string) {
  const payload = await payloadPromise
  return (await payload.find({ collection: 'redirects', where: { from: { equals: from } } })).docs
}

async function setup() {
  const payload = await payloadPromise
  tracker ??= new Tracker(payload)
  const { category, subcategory } = await createCategoryPair(payload, tracker)
  const brand = await createBrand(payload, tracker)
  const product = await createProduct(payload, tracker, { subcategoryId: subcategory.id, brandId: brand.id })
  return { payload, category, subcategory, brand, product }
}

describe('Redirecionamentos automáticos', () => {
  it('produto publicado: A→B cria, B→C reaponta A, voltar para A não deixa loop', async () => {
    const { payload, product } = await setup()
    const image = await createImage(payload, tracker)
    await makePublishable(payload, product.id, image.id)
    const id = uid()
    const [a, b, c] = [`a-teste-${id}`, `b-teste-${id}`, `c-teste-${id}`]

    await payload.update({ collection: 'products', id: product.id, data: { slug: a } })
    await payload.update({ collection: 'products', id: product.id, data: { slug: b } })
    expect((await redirectsFrom(`/produtos/${a}/`))[0]?.to).toBe(`/produtos/${b}/`)

    await payload.update({ collection: 'products', id: product.id, data: { slug: c } })
    expect((await redirectsFrom(`/produtos/${a}/`))[0]?.to).toBe(`/produtos/${c}/`)
    expect((await redirectsFrom(`/produtos/${b}/`))[0]?.to).toBe(`/produtos/${c}/`)

    await payload.update({ collection: 'products', id: product.id, data: { slug: a } })
    expect(await redirectsFrom(`/produtos/${a}/`)).toHaveLength(0)
    expect((await redirectsFrom(`/produtos/${c}/`))[0]?.to).toBe(`/produtos/${a}/`)
  })

  it('produto em rascunho não cria redirecionamento', async () => {
    const { payload, product } = await setup()
    const old = product.slug
    await payload.update({ collection: 'products', id: product.id, data: { slug: `rascunho-teste-${uid()}` } })
    expect(await redirectsFrom(`/produtos/${old}/`)).toHaveLength(0)
  })

  it('marca renomeada e categoria de 1º nível renomeada (com as subcategorias)', async () => {
    const { payload, category, subcategory, brand } = await setup()
    const id = uid()
    const oldBrand = brand.slug
    await payload.update({ collection: 'brands', id: brand.id, data: { slug: `marca-teste-${id}` } })
    expect((await redirectsFrom(`/marcas/${oldBrand}/`))[0]?.to).toBe(`/marcas/marca-teste-${id}/`)

    const oldCategory = category.slug
    await payload.update({ collection: 'categories', id: category.id, data: { slug: `cat-teste-${id}` } })
    expect((await redirectsFrom(`/${oldCategory}/`))[0]?.to).toBe(`/cat-teste-${id}/`)
    expect((await redirectsFrom(`/${oldCategory}/${subcategory.slug}/`))[0]?.to).toBe(`/cat-teste-${id}/${subcategory.slug}/`)
  })
})
