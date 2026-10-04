import type { CollectionConfig } from 'payload'

import { adminFieldAccess, adminOnly, adminOrSelf, loggedIn, roleForNewUser, type Role } from '../access'

export const Users: CollectionConfig = {
  slug: 'users',
  labels: { singular: 'Usuário', plural: 'Usuários' },
  admin: { useAsTitle: 'name', defaultColumns: ['name', 'email', 'role'], group: 'Sistema' },
  auth: { maxLoginAttempts: 5, lockTime: 15 * 60 * 1000 },
  access: { read: loggedIn, create: adminOnly, update: adminOrSelf, delete: adminOnly },
  hooks: {
    beforeChange: [
      async ({ data, operation, req }) => {
        if (operation === 'create') {
          const { totalDocs } = await req.payload.count({ collection: 'users', req, overrideAccess: true })
          data.role = roleForNewUser(data.role as Role | undefined, totalDocs)
        }
        return data
      },
    ],
  },
  fields: [
    { name: 'name', label: 'Nome', type: 'text', required: true },
    {
      name: 'role',
      label: 'Papel',
      type: 'select',
      required: true,
      defaultValue: 'redator',
      saveToJWT: true,
      access: { create: adminFieldAccess, update: adminFieldAccess },
      admin: {
        position: 'sidebar',
        description: 'Administrador: tudo. Editor: publica e cuida de ofertas. Redator: só rascunhos.',
      },
      options: [
        { label: 'Administrador', value: 'admin' },
        { label: 'Editor', value: 'editor' },
        { label: 'Redator', value: 'redator' },
      ],
    },
  ],
}
