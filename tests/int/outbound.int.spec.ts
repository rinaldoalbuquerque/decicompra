import { afterAll, describe, expect, it } from 'vitest'

import { GET } from '@/app/(frontend)/ir/[id]/route'

import {
  createBrand,
  createCategoryPair,
  createImage,
  createOffer,
  createProduct,
  createStore,
  makePublishable,
  Tracker,
} from './helpers/fixtures'
import { getTestPayload } from './helpers/getTestPayload'

const payloadPromise = getTestPayload()
let tracker: Tracker

afterAll(async () => tracker?.cleanup())

const go = (id: string | number) => GET(new Request(`http://localhost/ir/${id}`), { params: Promise.resolve({ id: String(id) }) })

async function setup(storeActive = true) {
  const payload = await payloadPromise
  tracker ??= new Tracker(payload)
  const { subcategory } = await createCategoryPair(payload, tracker)
  const brand = await createBrand(payload, tracker)
  const store = await createStore(payload, tracker, { active: storeActive })
  const product = await createProduct(payload, tracker, { subcategoryId: subcategory.id, brandId: brand.id })
  const [variant] = (await payload.find({ collection: 'variants', where: { product: { equals: product.id } } })).docs
  const offer = await createOffer(payload, tracker, { productId: product.id, variantId: variant.id, storeId: store.id })
  return { payload, product, offer }
}

describe('/ir/{id}', () => {
  it('redireciona para o afiliado, sem cache e sem indexação; troca de URL vale na hora', async () => {
    const { payload, offer } = await setup()
    let res = await go(offer.id)
    expect(res.status).toBe(302)
    expect(res.headers.get('location')).toBe(offer.affiliateUrl)
    expect(res.headers.get('x-robots-tag')).toBe('noindex, nofollow')
    expect(res.headers.get('cache-control')).toBe('no-store')

    await payload.update({ collection: 'offers', id: offer.id, data: { affiliateUrl: 'https://nova.loja.com.br/x?tag=novo' } })
    res = await go(offer.id)
    expect(res.headers.get('location')).toBe('https://nova.loja.com.br/x?tag=novo')
  })

  it('oferta indisponível ou loja inativa volta para o produto publicado; produto em rascunho vai para a home', async () => {
    const { payload, product, offer } = await setup()
    await payload.update({ collection: 'offers', id: offer.id, data: { status: 'unavailable' } })
    expect((await go(offer.id)).headers.get('location')).toBe('/')

    const image = await createImage(payload, tracker)
    await makePublishable(payload, product.id, image.id)
    expect((await go(offer.id)).headers.get('location')).toBe(`/produtos/${product.slug}/`)

    const inactive = await setup(false)
    await makePublishable(payload, inactive.product.id, (await createImage(payload, tracker)).id)
    expect((await go(inactive.offer.id)).headers.get('location')).toBe(`/produtos/${inactive.product.slug}/`)
  })

  it('id inexistente ou inválido vai para a home', async () => {
    expect((await go(999_999_999)).headers.get('location')).toBe('/')
    expect((await go('abc')).headers.get('location')).toBe('/')
  })
})
