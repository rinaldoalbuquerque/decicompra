import { ValidationError } from 'payload'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

import { findRedirect } from '@/lib/data/redirects'
import { setRevalidator } from '@/lib/revalidate'
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
afterAll(async () => {
  setRevalidator(null)
  await tracker?.cleanup()
})

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

  it('redirecionamento manual que fecharia um laço (ou aponta para si mesmo) é recusado', async () => {
    const payload = await payloadPromise
    const a = `/guias/laco-a-${uid()}/`
    const b = `/guias/laco-b-${uid()}/`
    const c = `/guias/laco-c-${uid()}/`
    tracker.add('redirects', await payload.create({ collection: 'redirects', data: { from: a, to: b } as never }))
    tracker.add('redirects', await payload.create({ collection: 'redirects', data: { from: b, to: c } as never }))
    for (const data of [{ from: c, to: a }, { from: c, to: c }]) {
      const error = await payload.create({ collection: 'redirects', data: data as never }).catch((e: unknown) => e)
      expect(error).toBeInstanceOf(ValidationError)
      expect(JSON.stringify((error as ValidationError).data)).toContain('laço')
    }
  })

  it('criar ou apagar um redirecionamento atualiza a página do endereço antigo', async () => {
    const payload = await payloadPromise
    const paths: string[] = []
    setRevalidator((path) => {
      paths.push(path)
    })
    const from = `/produtos/antigo-${uid()}/`
    const doc = await payload.create({ collection: 'redirects', data: { from, to: '/produtos/demo-tv-alfa/' } as never })
    expect(paths).toContain(from)
    paths.length = 0
    await payload.delete({ collection: 'redirects', id: doc.id })
    expect(paths).toContain(from)
    setRevalidator(null)
  })
})
