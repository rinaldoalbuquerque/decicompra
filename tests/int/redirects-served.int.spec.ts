import { afterAll, beforeAll, describe, expect, it } from 'vitest'

import { findRedirect } from '@/lib/data/redirects'
import { seedDemo } from '@/seed/demo'

import { Tracker, uid } from './helpers/fixtures'
import { getTestPayload } from './helpers/getTestPayload'

const payloadPromise = getTestPayload()
let tracker: Tracker

beforeAll(async () => {
  const payload = await payloadPromise
  tracker = new Tracker(payload)
  await seedDemo(payload)
})
afterAll(async () => tracker?.cleanup())

describe('Redirecionamentos servidos', () => {
  it('o seed de demonstração cria /produtos/demo-tv-antiga/ → /produtos/demo-tv-alfa/', async () => {
    expect(await findRedirect('/produtos/demo-tv-antiga/')).toBe('/produtos/demo-tv-alfa/')
  })

  it('endereço sem redirecionamento → null; destino igual à origem é ignorado', async () => {
    const payload = await payloadPromise
    expect(await findRedirect(`/produtos/nada-${uid()}/`)).toBeNull()
    const from = `/guias/laco-${uid()}/`
    const loop = await payload
      .create({ collection: 'redirects', data: { from, to: from } as never })
      .catch(() => null)
    if (loop) tracker.add('redirects', loop)
    expect(await findRedirect(from)).toBeNull()
  })
})
