import type { CollectionConfig } from 'payload'

export const Users: CollectionConfig = {
  slug: 'users',
  labels: { singular: 'Usuário', plural: 'Usuários' },
  admin: { useAsTitle: 'name', defaultColumns: ['name', 'email'] },
  auth: { maxLoginAttempts: 5, lockTime: 15 * 60 * 1000 },
  fields: [{ name: 'name', label: 'Nome', type: 'text', required: true }],
}
