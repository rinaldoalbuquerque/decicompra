import { APIError, ValidationError } from 'payload'
import { afterAll, describe, expect, it } from 'vitest'

import { GET } from '@/app/(frontend)/ir/[id]/route'

import { createBrand, createCategoryPair, createOffer, createProduct, createStore, Tracker } from './helpers/fixtures'
import { getTestPayload } from './helpers/getTestPayload'

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
  return { payload, brand, store, product, variant }
}

const go = (id: string) => GET(new Request(`http://localhost/ir/${id}`), { params: Promise.resolve({ id }) })

describe('Pendências da 1A', () => {
  it('guarda número com vírgula na forma canônica', async () => {
    const { payload, product } = await setup()
    const updated = await payload.update({ collection: 'products', id: product.id, data: { specs: [{ key: 'taxa_atualizacao', value: ' 4,5 ' }] } })
    expect(updated.specs?.find((r) => r.key === 'taxa_atualizacao')?.value).toBe('4.5')
  })

  it('recusa nota com mais de uma casa decimal', async () => {
    const { payload, product } = await setup()
    const error = await payload
      .update({ collection: 'products', id: product.id, data: { scores: [{ key: 'imagem', score: 7.25 }] } })
      .catch((e: unknown) => e)
    expect(error).toBeInstanceOf(ValidationError)
    expect(JSON.stringify((error as ValidationError).data)).toContain('uma casa decimal')
  })

  it('/ir/ com id enorme ou inválido volta para a home sem erro', async () => {
    for (const id of ['99999999999', '00012abc', '0']) {
      const res = await go(id)
      expect(res.status).toBe(302)
      expect(res.headers.get('location')).toBe('/')
    }
  })

  it('não apaga marca nem loja em uso', async () => {
    const { payload, brand, store, product, variant } = await setup()
    await createOffer(payload, tracker, { productId: product.id, variantId: variant.id, storeId: store.id })
    for (const [collection, id] of [['brands', brand.id], ['stores', store.id]] as const) {
      const error = await payload.delete({ collection, id }).catch((e: unknown) => e)
      expect(error).toBeInstanceOf(APIError)
      expect((error as APIError).status).toBe(409)
      expect((error as APIError).message).toContain('Não é possível apagar')
    }
  })
})
