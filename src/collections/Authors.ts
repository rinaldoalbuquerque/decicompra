import type { CollectionConfig } from 'payload'

import { adminOrEditor, anyone } from '../access'
import { slugField } from '../fields/slug'
import { revalidateAuthor } from './revalidation-hooks'

export const Authors: CollectionConfig = {
  slug: 'authors',
  labels: { singular: 'Autor', plural: 'Autores' },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'slug'],
    group: 'Conteúdo',
    description: 'Quem assina os conteúdos. Na v1 há só a "Equipe DeciCompra"; não crie autores fictícios.',
  },
  access: { read: anyone, create: adminOrEditor, update: adminOrEditor, delete: adminOrEditor },
  hooks: { afterChange: [revalidateAuthor] },
  fields: [
    { name: 'name', label: 'Nome', type: 'text', required: true },
    slugField('name'),
    { name: 'bio', label: 'Bio', type: 'textarea' },
    { name: 'image', label: 'Imagem', type: 'upload', relationTo: 'media' },
  ],
}
