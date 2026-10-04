import { ValidationError } from 'payload'
import { afterAll, describe, expect, it } from 'vitest'

import { relId } from '@/lib/relations'

import {
  createBrand,
  createCategoryPair,
  createImage,
  createOffer,
  createProduct,
  createStore,
  makePublishable,
  sampleSpecTemplate,
  Tracker,
} from './helpers/fixtures'
import { getTestPayload } from './helpers/getTestPayload'
import { getTestUsers } from './helpers/users'

// Regressões apontadas pela revisão final da Fase 1A
const payloadPromise = getTestPayload()
let tracker: Tracker

afterAll(async () => tracker?.cleanup())

async function publishedProduct() {
  const payload = await payloadPromise
  tracker ??= new Tracker(payload)
  const { subcategory } = await createCategoryPair(payload, tracker)
  const brand = await createBrand(payload, tracker)
  const product = await createProduct(payload, tracker, { subcategoryId: subcategory.id, brandId: brand.id })
  const image = await createImage(payload, tracker)
  await makePublishable(payload, product.id, image.id)
  const [variant] = (await payload.find({ collection: 'variants', where: { product: { equals: product.id } } })).docs
  return { payload, subcategory, brand, product, variant }
}

describe('Endurecimento após a revisão', () => {
  it('mudar o tipo de um atributo por variante não trava o salvamento da subcategoria', async () => {
    const { payload, subcategory } = await publishedProduct()
    const template = sampleSpecTemplate.map((attr) =>
      attr.key === 'tamanho' ? { ...attr, type: 'option' as const, options: ['65'] } : attr,
    )
    const saved = await payload.update({ collection: 'categories', id: subcategory.id, data: { specTemplate: template } })
    expect(saved.specTemplate?.find((a) => a.key === 'tamanho')?.type).toBe('option')
  })

  it('redator não cria nem edita variantes de produto publicado', async () => {
    const { payload, product, variant } = await publishedProduct()
    const { redator } = await getTestUsers(payload)
    await expect(
      payload.update({ collection: 'variants', id: variant.id, data: { label: 'Hack' }, user: redator, overrideAccess: false }),
    ).rejects.toThrow()
    const created = await payload
      .create({ collection: 'variants', data: { product: product.id, label: '77"' }, user: redator, overrideAccess: false })
      .catch((e: unknown) => e)
    expect(JSON.stringify((created as ValidationError).data ?? created)).toContain('Redatores só podem alterar variantes de produtos em rascunho')
  })

  it('a variante não troca de produto', async () => {
    const { payload, subcategory, brand, product, variant } = await publishedProduct()
    const { editor } = await getTestUsers(payload)
    const other = await createProduct(payload, tracker, { subcategoryId: subcategory.id, brandId: brand.id })
    const updated = await payload.update({
      collection: 'variants',
      id: variant.id,
      data: { product: other.id },
      user: editor,
      overrideAccess: false,
    })
    expect(relId(updated.product)).toBe(product.id)
  })

  it('"tem oferta ativa" não pode ser sobrescrito ao salvar o produto', async () => {
    const { payload, product, variant } = await publishedProduct()
    const { editor } = await getTestUsers(payload)
    const forced = await payload.update({
      collection: 'products',
      id: product.id,
      data: { hasActiveOffer: true },
      user: editor,
      overrideAccess: false,
    })
    expect(forced.hasActiveOffer).toBe(false)

    const store = await createStore(payload, tracker)
    await createOffer(payload, tracker, { productId: product.id, variantId: variant.id, storeId: store.id })
    const stale = await payload.update({
      collection: 'products',
      id: product.id,
      data: { hasActiveOffer: false },
      user: editor,
      overrideAccess: false,
    })
    expect(stale.hasActiveOffer).toBe(true)
  })

  it('anônimo não vê notas internas nem ofertas/variantes de rascunho', async () => {
    const { payload, subcategory, brand, product, variant } = await publishedProduct()
    const store = await createStore(payload, tracker)
    await payload.update({ collection: 'stores', id: store.id, data: { notes: 'regra interna' } })
    const offer = await createOffer(payload, tracker, { productId: product.id, variantId: variant.id, storeId: store.id })
    await payload.update({ collection: 'offers', id: offer.id, data: { notes: 'nota interna' } })

    const draft = await createProduct(payload, tracker, { subcategoryId: subcategory.id, brandId: brand.id })
    const [draftVariant] = (await payload.find({ collection: 'variants', where: { product: { equals: draft.id } } })).docs
    const draftOffer = await createOffer(payload, tracker, { productId: draft.id, variantId: draftVariant.id, storeId: store.id })

    const publicOffer = await payload.findByID({ collection: 'offers', id: offer.id, overrideAccess: false })
    expect(publicOffer.notes).toBeUndefined()
    const publicStore = await payload.findByID({ collection: 'stores', id: store.id, overrideAccess: false })
    expect(publicStore.notes).toBeUndefined()

    const offers = await payload.find({ collection: 'offers', where: { id: { equals: draftOffer.id } }, overrideAccess: false })
    expect(offers.totalDocs).toBe(0)
    const variants = await payload.find({ collection: 'variants', where: { id: { equals: draftVariant.id } }, overrideAccess: false })
    expect(variants.totalDocs).toBe(0)
  })

  it('subcategoria com produtos não vira categoria de 1º nível', async () => {
    const { payload, subcategory } = await publishedProduct()
    const error = await payload
      .update({ collection: 'categories', id: subcategory.id, data: { parent: null } })
      .catch((e: unknown) => e)
    expect(error).toBeInstanceOf(ValidationError)
    expect(JSON.stringify((error as ValidationError).data)).toContain('tem produtos e não pode virar categoria de 1º nível')
  })

  it('apagar vários produtos publicados de uma vez apaga variantes e ofertas sem erro', async () => {
    const a = await publishedProduct()
    const b = await publishedProduct()
    const store = await createStore(a.payload, tracker)
    await createOffer(a.payload, tracker, { productId: a.product.id, variantId: a.variant.id, storeId: store.id })
    await createOffer(b.payload, tracker, { productId: b.product.id, variantId: b.variant.id, storeId: store.id })

    const result = await a.payload.delete({ collection: 'products', where: { id: { in: [a.product.id, b.product.id] } } })
    expect(result.errors).toEqual([])
    const leftovers = await a.payload.find({
      collection: 'variants',
      where: { product: { in: [a.product.id, b.product.id] } },
    })
    expect(leftovers.totalDocs).toBe(0)
  })
})
