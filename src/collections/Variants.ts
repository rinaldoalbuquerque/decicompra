import type { CollectionConfig } from 'payload'

import { adminOrEditor, anyone, loggedIn } from '../access'
import { guardVariantDelete, prepareVariant, promoteReference, syncReference } from './variants/hooks'

export const Variants: CollectionConfig = {
  slug: 'variants',
  labels: { singular: 'Variante', plural: 'Variantes' },
  admin: { useAsTitle: 'title', defaultColumns: ['title', 'modelCode', 'isReference'], group: 'Catálogo' },
  access: { read: anyone, create: loggedIn, update: loggedIn, delete: adminOrEditor },
  hooks: {
    beforeChange: [prepareVariant],
    afterChange: [syncReference],
    beforeDelete: [guardVariantDelete],
    afterDelete: [promoteReference],
  },
  fields: [
    { name: 'product', label: 'Produto', type: 'relationship', relationTo: 'products', required: true, index: true },
    { name: 'label', label: 'Rótulo', type: 'text', required: true, admin: { description: 'ex.: 55", 220 V, 8 GB/256 GB' } },
    { name: 'modelCode', label: 'Código do modelo', type: 'text', admin: { description: 'ex.: OLED55C4PSA' } },
    {
      name: 'voltage',
      label: 'Voltagem',
      type: 'select',
      options: [
        { label: '127 V', value: '127v' },
        { label: '220 V', value: '220v' },
        { label: 'Bivolt', value: 'bivolt' },
      ],
    },
    {
      name: 'isReference',
      label: 'Variante de referência',
      type: 'checkbox',
      defaultValue: false,
      admin: { description: 'A usada em cards, listas e comparativos. Só uma por produto.' },
    },
    {
      name: 'specs',
      label: 'Especificações desta variante',
      type: 'array',
      admin: { description: 'As linhas vêm do modelo da subcategoria (atributos que variam por variante).' },
      fields: [
        { name: 'key', type: 'text', required: true, admin: { hidden: true } },
        {
          type: 'row',
          fields: [
            { name: 'label', label: 'Atributo', type: 'text', admin: { readOnly: true, width: '50%' } },
            { name: 'value', label: 'Valor', type: 'text', admin: { width: '50%' } },
          ],
        },
      ],
    },
    { name: 'title', label: 'Título', type: 'text', admin: { readOnly: true, position: 'sidebar' } },
  ],
}
