import { ValidationError } from 'payload'
import { afterAll, describe, expect, it } from 'vitest'

import { createBrand, createCategoryPair, createOffer, createProduct, createStore, Tracker } from './helpers/fixtures'
import { getTestPayload } from './helpers/getTestPayload'
import { getTestUsers } from './helpers/users'

const payloadPromise = getTestPayload()
let tracker: Tracker

afterAll(async () => tracker?.cleanup())

async function setup() {
  const payload = await payloadPromise
  tracker ??= new Tracker(payload)
  const { subcategory } = await createCategoryPair(payload, tracker)
  const brand = await createBrand(payload, tracker)
  const store = await createStore(payload, tracker)
  const product = await createProduct(payload, tracker, { subcategoryId: subcategory.id, brandId: brand.id })
  const [variant] = (await payload.find({ collection: 'variants', where: { product: { equals: product.id } } })).docs
  return { payload, subcategory, brand, store, product, variant }
}

const productById = async (id: number) => (await payloadPromise).findByID({ collection: 'products', id, depth: 0 })

describe('Ofertas', () => {
  it('monta o título e marca o produto como tendo oferta ativa', async () => {
    const { payload, store, product, variant } = await setup()
    const offer = await createOffer(payload, tracker, { productId: product.id, variantId: variant.id, storeId: store.id })
    expect(offer.title).toBe(`${variant.title} · ${store.name}`)
    expect((await productById(product.id)).hasActiveOffer).toBe(true)

    await payload.update({ collection: 'offers', id: offer.id, data: { status: 'unavailable' } })
    expect((await productById(product.id)).hasActiveOffer).toBe(false)

    await payload.update({ collection: 'offers', id: offer.id, data: { status: 'active' } })
    await payload.delete({ collection: 'offers', id: offer.id })
    expect((await productById(product.id)).hasActiveOffer).toBe(false)
  })

  it('recusa variante de outro produto, preço invertido e URL sem https', async () => {
    const { payload, subcategory, brand, store, product, variant } = await setup()
    const other = await createProduct(payload, tracker, { subcategoryId: subcategory.id, brandId: brand.id })

    const wrongVariant = await createOffer(payload, tracker, { productId: other.id, variantId: variant.id, storeId: store.id }).catch(
      (e: unknown) => e,
    )
    expect(JSON.stringify((wrongVariant as ValidationError).data)).toContain('não pertence a este produto')

    const inverted = await createOffer(payload, tracker, {
      productId: product.id,
      variantId: variant.id,
      storeId: store.id,
      data: { priceMin: 500, priceMax: 400 },
    }).catch((e: unknown) => e)
    expect(JSON.stringify((inverted as ValidationError).data)).toContain('não pode ser menor que o mínimo')

    const http = await createOffer(payload, tracker, {
      productId: product.id,
      variantId: variant.id,
      storeId: store.id,
      data: { affiliateUrl: 'http://loja.com.br/x' },
    }).catch((e: unknown) => e)
    expect(http).toBeInstanceOf(ValidationError)
  })

  it('apagar a variante ou o produto apaga as ofertas deles', async () => {
    const { payload, store, product, variant } = await setup()
    const extra = await payload.create({ collection: 'variants', data: { product: product.id, label: '65"' } })
    const offerOnExtra = await createOffer(payload, tracker, { productId: product.id, variantId: extra.id, storeId: store.id })
    await payload.delete({ collection: 'variants', id: extra.id })
    expect((await payload.find({ collection: 'offers', where: { id: { equals: offerOnExtra.id } } })).totalDocs).toBe(0)

    const offer = await createOffer(payload, tracker, { productId: product.id, variantId: variant.id, storeId: store.id })
    await payload.delete({ collection: 'products', id: product.id })
    expect((await payload.find({ collection: 'offers', where: { id: { equals: offer.id } } })).totalDocs).toBe(0)
  })

  it('editor cria oferta; redator não', async () => {
    const { payload, store, product, variant } = await setup()
    const { editor, redator } = await getTestUsers(payload)
    const data = {
      product: product.id,
      variant: variant.id,
      store: store.id,
      url: 'https://loja.com.br/p',
      affiliateUrl: 'https://loja.com.br/p?tag=x',
      priceMin: 10,
      priceMax: 20,
      verifiedAt: new Date().toISOString(),
      status: 'active' as const,
    }
    tracker.add('offers', await payload.create({ collection: 'offers', data, user: editor, overrideAccess: false }))
    await expect(payload.create({ collection: 'offers', data, user: redator, overrideAccess: false })).rejects.toThrow()
  })
})
