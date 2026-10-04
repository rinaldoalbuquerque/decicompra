import type { CollectionConfig } from 'payload'

import { adminOrEditor, anyone } from '../access'
import { relId } from '../lib/relations'
import { httpsUrl } from '../lib/url'
import { afterOfferChange, afterOfferDelete, prepareOffer } from './offers/hooks'

export const Offers: CollectionConfig = {
  slug: 'offers',
  labels: { singular: 'Oferta', plural: 'Ofertas' },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'priceMin', 'priceMax', 'verifiedAt', 'status'],
    group: 'Afiliados',
    description: 'Único lugar onde links e preços são editados. Os botões do site usam /ir/{id}.',
  },
  access: { read: anyone, create: adminOrEditor, update: adminOrEditor, delete: adminOrEditor },
  hooks: { beforeChange: [prepareOffer], afterChange: [afterOfferChange], afterDelete: [afterOfferDelete] },
  fields: [
    { name: 'product', label: 'Produto', type: 'relationship', relationTo: 'products', required: true, index: true },
    {
      name: 'variant',
      label: 'Variante',
      type: 'relationship',
      relationTo: 'variants',
      required: true,
      index: true,
      filterOptions: ({ siblingData }) => {
        const productId = relId((siblingData as { product?: unknown } | undefined)?.product)
        return productId === null ? true : { product: { equals: productId } }
      },
    },
    { name: 'store', label: 'Loja', type: 'relationship', relationTo: 'stores', required: true },
    { name: 'url', label: 'URL da página na loja', type: 'text', required: true, validate: httpsUrl() },
    {
      name: 'affiliateUrl',
      label: 'URL de afiliado',
      type: 'text',
      required: true,
      validate: httpsUrl(),
      admin: { description: 'Destino real do botão. Trocar aqui vale na hora em todo o site.' },
    },
    {
      type: 'row',
      fields: [
        { name: 'priceMin', label: 'Preço mínimo (R$)', type: 'number', required: true, min: 0, admin: { width: '50%' } },
        { name: 'priceMax', label: 'Preço máximo (R$)', type: 'number', required: true, min: 0, admin: { width: '50%' } },
      ],
    },
    {
      name: 'verifiedAt',
      label: 'Verificado em',
      type: 'date',
      required: true,
      defaultValue: () => new Date().toISOString(),
      admin: { position: 'sidebar' },
    },
    {
      name: 'status',
      label: 'Status',
      type: 'select',
      required: true,
      defaultValue: 'active',
      admin: { position: 'sidebar' },
      options: [
        { label: 'Ativa', value: 'active' },
        { label: 'Indisponível', value: 'unavailable' },
      ],
    },
    { name: 'notes', label: 'Observações internas', type: 'textarea' },
    { name: 'title', label: 'Título', type: 'text', admin: { readOnly: true, position: 'sidebar' } },
  ],
}
