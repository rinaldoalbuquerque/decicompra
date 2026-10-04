import { describe, expect, it } from 'vitest'

import { getTestPayload } from './helpers/getTestPayload'
import { getTestUsers } from './helpers/users'

describe('Usuários e papéis', () => {
  it('os usuários de teste têm os papéis pedidos', async () => {
    const payload = await getTestPayload()
    const users = await getTestUsers(payload)
    expect(users.admin.role).toBe('admin')
    expect(users.editor.role).toBe('editor')
    expect(users.redator.role).toBe('redator')
  })

  it('redator não cria usuários', async () => {
    const payload = await getTestPayload()
    const { redator } = await getTestUsers(payload)
    await expect(
      payload.create({
        collection: 'users',
        data: { name: 'Intruso', email: 'intruso@teste.decicompra.local', password: 'x-123456789', role: 'admin' },
        user: redator,
        overrideAccess: false,
      }),
    ).rejects.toThrow()
  })

  it('redator não muda o próprio papel', async () => {
    const payload = await getTestPayload()
    const { redator } = await getTestUsers(payload)
    const updated = await payload.update({
      collection: 'users',
      id: redator.id,
      data: { role: 'admin' },
      user: redator,
      overrideAccess: false,
    })
    expect(updated.role).toBe('redator')
  })

  it('redator não edita outro usuário', async () => {
    const payload = await getTestPayload()
    const { redator, editor } = await getTestUsers(payload)
    await expect(
      payload.update({ collection: 'users', id: editor.id, data: { name: 'Hack' }, user: redator, overrideAccess: false }),
    ).rejects.toThrow()
  })
})
