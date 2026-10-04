import type { CollectionConfig } from 'payload'

import { adminOnly, anyone, loggedInField } from '../access'
import { slugField } from '../fields/slug'
import { guardStoreDelete } from './stores/hooks'
import { revalidateStore } from './revalidation-hooks'

export const Stores: CollectionConfig = {
  slug: 'stores',
  labels: { singular: 'Loja', plural: 'Lojas' },
  admin: { useAsTitle: 'name', defaultColumns: ['name', 'active', 'affiliateProgram'], group: 'Afiliados' },
  access: { read: anyone, create: adminOnly, update: adminOnly, delete: adminOnly },
  hooks: { afterChange: [revalidateStore], beforeDelete: [guardStoreDelete] },
  fields: [
    { name: 'name', label: 'Nome', type: 'text', required: true },
    slugField('name'),
    { name: 'logo', label: 'Logo', type: 'upload', relationTo: 'media' },
    { name: 'affiliateProgram', label: 'Programa de afiliados', type: 'text' },
    {
      name: 'active',
      label: 'Ativa',
      type: 'checkbox',
      defaultValue: true,
      admin: { position: 'sidebar', description: 'Loja inativa: os links /ir/ dela levam para a página do produto.' },
    },
    {
      name: 'notes',
      label: 'Observações',
      type: 'textarea',
      access: { read: loggedInField },
      admin: { description: 'Regras do programa (ex.: "não exibir preço", "não usar imagens").' },
    },
  ],
}
