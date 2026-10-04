import type { Payload } from 'payload'

import type { Role } from '@/access'
import type { User } from '@/payload-types'

const PASSWORD = 'senha-de-teste-123'

// Admin primeiro: se a tabela estiver vazia, o primeiro usuário vira admin de qualquer forma
export async function getTestUsers(payload: Payload): Promise<Record<Role, User>> {
  const result = {} as Record<Role, User>
  for (const role of ['admin', 'editor', 'redator'] as const) {
    const email = `${role}@teste.decicompra.local`
    const found = await payload.find({ collection: 'users', where: { email: { equals: email } }, limit: 1 })
    result[role] =
      found.docs[0] ??
      (await payload.create({ collection: 'users', data: { name: `Teste ${role}`, email, password: PASSWORD, role } }))
  }
  return result
}
