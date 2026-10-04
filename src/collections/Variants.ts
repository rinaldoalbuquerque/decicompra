import type { CollectionConfig } from 'payload'

import { adminOrEditor, loggedIn, readOfPublishedProducts, updateVariants } from '../access'
import {
  deleteVariantOffers,
  guardVariantDelete,
  prepareVariant,
  promoteReference,
  refreshOfferTitles,
  syncReference,
} from './variants/hooks'

export const Variants: CollectionConfig = {
  slug: 'variants',
  labels: { singular: 'Variante', plural: 'Variantes' },
  admin: { useAsTitle: 'title', defaultColumns: ['title', 'modelCode', 'isReference'], group: 'Catálogo' },
  access: { read: readOfPublishedProducts, create: loggedIn, update: updateVariants, delete: adminOrEditor },
  hooks: {
    beforeChange: [prepareVariant],
    afterChange: [syncReference, refreshOfferTitles],
    beforeDelete: [guardVariantDelete, deleteVariantOffers],
    afterDelete: [promoteReference],
  },
  fields: [
    {
      name: 'product',
      label: 'Produto',
      type: 'relationship',
      relationTo: 'products',
      required: true,
      index: true,
      // Definido na criação; mudar de produto deixaria ofertas e referências inconsistentes
      access: { update: () => false },
    },
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
