import { APIError, ValidationError } from 'payload'
import { afterAll, describe, expect, it } from 'vitest'

import {
  ANALYSIS_DATA,
  createBrand,
  createCategoryPair,
  createImage,
  createProduct,
  makePublishable,
  Tracker,
} from './helpers/fixtures'
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
  const product = await createProduct(payload, tracker, { subcategoryId: subcategory.id, brandId: brand.id })
  return { payload, subcategory, brand, product }
}

async function variantsOf(productId: number) {
  const payload = await payloadPromise
  return (await payload.find({ collection: 'variants', where: { product: { equals: productId } }, sort: 'createdAt', limit: 50 })).docs
}

function messages(error: unknown): string {
  return JSON.stringify((error as ValidationError).data ?? (error as Error).message)
}

describe('Produtos', () => {
  it('cria a variante "Padrão" de referência e sincroniza especificações e notas', async () => {
    const { product } = await setup()
    const variants = await variantsOf(product.id)
    expect(variants).toHaveLength(1)
    expect(variants[0]).toMatchObject({ label: 'Padrão', isReference: true, title: `${product.name} — Padrão` })
    expect(variants[0].specs?.map((r) => r.key)).toEqual(['tamanho'])
    expect(product.specs?.map((r) => [r.key, r.label])).toEqual([
      ['painel', 'Painel'],
      ['taxa_atualizacao', 'Taxa de atualização (Hz)'],
    ])
    expect(product.scores?.map((r) => r.label)).toEqual(['Imagem (60%)', 'Custo-benefício (40%)'])
    expect(product.finalScore).toBeNull()
  })

  it('calcula a nota final quando todos os critérios têm nota', async () => {
    const { payload, product } = await setup()
    const updated = await payload.update({
      collection: 'products',
      id: product.id,
      data: { scores: [{ key: 'imagem', score: 9 }, { key: 'custo_beneficio', score: 8 }] },
    })
    expect(updated.finalScore).toBe(8.6)
  })

  it('recusa valor fora das opções', async () => {
    const { payload, product } = await setup()
    const error = await payload
      .update({ collection: 'products', id: product.id, data: { specs: [{ key: 'painel', value: 'Plasma' }] } })
      .catch((e: unknown) => e)
    expect(error).toBeInstanceOf(ValidationError)
    expect(messages(error)).toContain('uma das opções')
  })

  it('não sai de rascunho sem os requisitos', async () => {
    const { payload, product } = await setup()
    const error = await payload
      .update({ collection: 'products', id: product.id, data: { status: 'ficha' } })
      .catch((e: unknown) => e)
    expect(error).toBeInstanceOf(ValidationError)
    expect(messages(error)).toContain('nota de todos os critérios')
    expect(messages(error)).toContain('Tamanho (Padrão)')
  })

  it('publica como ficha e depois como análise, preenchendo a data de publicação', async () => {
    const { payload, product } = await setup()
    const image = await createImage(payload, tracker)
    const asFicha = await makePublishable(payload, product.id, image.id)
    expect(asFicha.status).toBe('ficha')

    const missing = await payload
      .update({ collection: 'products', id: product.id, data: { status: 'analise' } })
      .catch((e: unknown) => e)
    expect(messages(missing)).toContain('veredito')

    const asAnalise = await payload.update({
      collection: 'products',
      id: product.id,
      data: { ...ANALYSIS_DATA, status: 'analise' },
    })
    expect(asAnalise.status).toBe('analise')
    expect(asAnalise.publishedAt).toBeTruthy()
  })

  it('marcar outra variante como referência desmarca a anterior; apagar a referência promove outra', async () => {
    const { payload, product } = await setup()
    const extra = await payload.create({ collection: 'variants', data: { product: product.id, label: '65"', isReference: true } })
    let variants = await variantsOf(product.id)
    expect(variants.filter((v) => v.isReference).map((v) => v.id)).toEqual([extra.id])

    await payload.delete({ collection: 'variants', id: extra.id })
    variants = await variantsOf(product.id)
    expect(variants).toHaveLength(1)
    expect(variants[0].isReference).toBe(true)
  })

  it('recusa rótulo de variante repetido no mesmo produto', async () => {
    const { payload, product } = await setup()
    const error = await payload
      .create({ collection: 'variants', data: { product: product.id, label: 'Padrão' } })
      .catch((e: unknown) => e)
    expect(error).toBeInstanceOf(ValidationError)
    expect(messages(error)).toContain('Já existe uma variante com este rótulo')
  })

  it('não apaga a única variante de produto publicado', async () => {
    const { payload, product } = await setup()
    const image = await createImage(payload, tracker)
    await makePublishable(payload, product.id, image.id)
    const [only] = await variantsOf(product.id)
    const error = await payload.delete({ collection: 'variants', id: only.id }).catch((e: unknown) => e)
    expect(error).toBeInstanceOf(APIError)
    expect((error as APIError).status).toBe(409)
  })

  it('redator: salva rascunho, não publica e não edita produto publicado', async () => {
    const { payload, product } = await setup()
    const { redator } = await getTestUsers(payload)
    const asDraft = await payload.update({
      collection: 'products',
      id: product.id,
      data: { verdict: 'Rascunho do redator' },
      user: redator,
      overrideAccess: false,
    })
    expect(asDraft.verdict).toBe('Rascunho do redator')

    const publish = await payload
      .update({ collection: 'products', id: product.id, data: { status: 'ficha' }, user: redator, overrideAccess: false })
      .catch((e: unknown) => e)
    expect(messages(publish)).toContain('Redatores só podem salvar como rascunho')

    const image = await createImage(payload, tracker)
    await makePublishable(payload, product.id, image.id)
    await expect(
      payload.update({ collection: 'products', id: product.id, data: { verdict: 'x' }, user: redator, overrideAccess: false }),
    ).rejects.toThrow()
  })

  it('anônimo não lê rascunho', async () => {
    const { payload, product } = await setup()
    const result = await payload.find({ collection: 'products', where: { id: { equals: product.id } }, overrideAccess: false })
    expect(result.totalDocs).toBe(0)
  })

  it('apagar o produto apaga as variantes; subcategoria com produto não pode ser apagada', async () => {
    const { payload, product, subcategory } = await setup()
    const blocked = await payload.delete({ collection: 'categories', id: subcategory.id }).catch((e: unknown) => e)
    expect(blocked).toBeInstanceOf(APIError)

    await payload.delete({ collection: 'products', id: product.id })
    expect(await variantsOf(product.id)).toHaveLength(0)
  })
})
