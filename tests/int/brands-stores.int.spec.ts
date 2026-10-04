import { ValidationError } from 'payload'
import { afterAll, describe, expect, it } from 'vitest'

import { createBrand, createStore, Tracker, uid } from './helpers/fixtures'
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

describe('Marcas e lojas', () => {
  it('cria marca e loja', async () => {
    const payload = await setup()
    const brand = await createBrand(payload, tracker)
    const store = await createStore(payload, tracker)
    expect(brand.slug).toMatch(/^marca-/)
    expect(store.active).toBe(true)
  })

  it('recusa site oficial sem https', async () => {
    const payload = await setup()
    const error = await payload
      .create({ collection: 'brands', data: { name: `M ${uid()}`, officialSite: 'www.lg.com' } })
      .catch((e: unknown) => e)
    expect(error).toBeInstanceOf(ValidationError)
  })

  it('editor cria marca mas não cria loja', async () => {
    const payload = await setup()
    const { editor } = await getTestUsers(payload)
    const brand = await payload.create({
      collection: 'brands',
      data: { name: `M ${uid()}` },
      user: editor,
      overrideAccess: false,
    })
    tracker.add('brands', brand)
    await expect(
      payload.create({ collection: 'stores', data: { name: `L ${uid()}` }, user: editor, overrideAccess: false }),
    ).rejects.toThrow()
  })
})
