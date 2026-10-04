import { describe, expect, it } from 'vitest'

import { getTestPayload } from './helpers/getTestPayload'

describe('Payload', () => {
  it('conecta ao banco de teste e consulta usuários', async () => {
    const payload = await getTestPayload()
    const result = await payload.find({ collection: 'users', limit: 1 })
    expect(result.totalDocs).toBeGreaterThanOrEqual(0)
  })

  it('mantém o GraphQL desativado', async () => {
    const payload = await getTestPayload()
    expect(payload.config.graphQL.disable).toBe(true)
  })
})
