import { APIError, ValidationError } from 'payload'
import { afterAll, describe, expect, it } from 'vitest'

import { createCategoryPair, Tracker, uid } from './helpers/fixtures'
import { getTestPayload } from './helpers/getTestPayload'
import { getTestUsers } from './helpers/users'

const payloadPromise = getTestPayload()
let tracker: Tracker

afterAll(async () => tracker?.cleanup())

async function setup() {
  const payload = await payloadPromise
  tracker ??= new Tracker(payload)
  return payload
}

describe('Categorias', () => {
  it('cria categoria e subcategoria e gera o slug pelo nome', async () => {
    const payload = await setup()
    const id = uid()
    const doc = tracker.add('categories', await payload.create({ collection: 'categories', data: { name: `Casa & Lar ${id}` } }))
    expect(doc.slug).toBe(`casa-e-lar-${id}`)
    const { subcategory } = await createCategoryPair(payload, tracker)
    expect(subcategory.criteria).toHaveLength(2)
  })

  it('categoria de 1º nível não guarda modelo, critérios nem âncora', async () => {
    const payload = await setup()
    const doc = tracker.add(
      'categories',
      await payload.create({
        collection: 'categories',
        data: { name: `Topo ${uid()}`, isAnchor: true, criteria: [{ key: 'x', name: 'X', weight: 100 }] },
      }),
    )
    expect(doc.criteria).toEqual([])
    expect(doc.isAnchor).toBe(false)
  })

  it('recusa pesos que não somam 100', async () => {
    const payload = await setup()
    const error = await createCategoryPair(payload, tracker, {
      criteria: [{ key: 'imagem', name: 'Imagem', weight: 50 }],
    }).catch((e: unknown) => e)
    expect(error).toBeInstanceOf(ValidationError)
    expect(JSON.stringify((error as ValidationError).data)).toContain('soma dos pesos precisa ser exatamente 100')
  })

  it('recusa 3 níveis', async () => {
    const payload = await setup()
    const { subcategory } = await createCategoryPair(payload, tracker)
    const error = await payload
      .create({ collection: 'categories', data: { name: `Neta ${uid()}`, parent: subcategory.id } })
      .catch((e: unknown) => e)
    expect(error).toBeInstanceOf(ValidationError)
    expect(JSON.stringify((error as ValidationError).data)).toContain('só existem 2 níveis')
  })

  it('não apaga categoria que tem subcategorias', async () => {
    const payload = await setup()
    const { category } = await createCategoryPair(payload, tracker)
    const error = await payload.delete({ collection: 'categories', id: category.id }).catch((e: unknown) => e)
    expect(error).toBeInstanceOf(APIError)
    expect((error as APIError).status).toBe(409)
  })

  it('redator não cria categorias; anônimo lê', async () => {
    const payload = await setup()
    const { redator } = await getTestUsers(payload)
    await expect(
      payload.create({ collection: 'categories', data: { name: `X ${uid()}` }, user: redator, overrideAccess: false }),
    ).rejects.toThrow()
    const read = await payload.find({ collection: 'categories', limit: 1, overrideAccess: false })
    expect(read.docs).toBeDefined()
  })
})
