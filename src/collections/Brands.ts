import type { CollectionConfig } from 'payload'

import { adminOrEditor, anyone } from '../access'
import { slugField } from '../fields/slug'
import { httpsUrl } from '../lib/url'

export const Brands: CollectionConfig = {
  slug: 'brands',
  labels: { singular: 'Marca', plural: 'Marcas' },
  admin: { useAsTitle: 'name', defaultColumns: ['name', 'slug'], group: 'Catálogo' },
  access: { read: anyone, create: adminOrEditor, update: adminOrEditor, delete: adminOrEditor },
  fields: [
    { name: 'name', label: 'Nome', type: 'text', required: true },
    slugField('name'),
    { name: 'logo', label: 'Logo', type: 'upload', relationTo: 'media' },
    { name: 'description', label: 'Descrição', type: 'textarea' },
    { name: 'officialSite', label: 'Site oficial', type: 'text', validate: httpsUrl({ optional: true }) },
  ],
}
