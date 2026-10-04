import type { CollectionConfig } from 'payload'

import { adminOrEditor, loggedIn, readPublishedProducts, updateProducts } from '../access'
import { slugField } from '../fields/slug'
import { httpsUrl } from '../lib/url'
import { validateScore } from './products/validate-score'
import { afterProductChange, cascadeProductDelete, prepareProduct } from './products/hooks'
import { revalidateDeletedProduct, revalidateProduct } from './revalidation-hooks'

export const Products: CollectionConfig = {
  slug: 'products',
  labels: { singular: 'Produto', plural: 'Produtos' },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'brand', 'subcategory', 'status', 'finalScore', 'hasActiveOffer'],
    group: 'Catálogo',
  },
  versions: { maxPerDoc: 30 },
  access: { read: readPublishedProducts, create: loggedIn, update: updateProducts, delete: adminOrEditor },
  hooks: {
    beforeChange: [prepareProduct],
    afterChange: [afterProductChange, revalidateProduct],
    beforeDelete: [cascadeProductDelete],
    afterDelete: [revalidateDeletedProduct],
  },
  fields: [
    { name: 'name', label: 'Nome', type: 'text', required: true, admin: { description: 'ex.: LG C4' } },
    slugField('name'),
    {
      name: 'status',
      label: 'Status',
      type: 'select',
      required: true,
      defaultValue: 'rascunho',
      admin: { position: 'sidebar' },
      options: [
        { label: 'Rascunho', value: 'rascunho' },
        { label: 'Ficha (fora do Google)', value: 'ficha' },
        { label: 'Análise (publicada)', value: 'analise' },
      ],
    },
    {
      name: 'finalScore',
      label: 'Nota DeciCompra',
      type: 'number',
      admin: { readOnly: true, position: 'sidebar', description: 'Calculada pelas notas de cada critério.' },
    },
    {
      name: 'hasActiveOffer',
      label: 'Tem oferta ativa',
      type: 'checkbox',
      defaultValue: false,
      admin: { readOnly: true, position: 'sidebar' },
    },
    { name: 'publishedAt', label: 'Publicado em', type: 'date', admin: { position: 'sidebar' } },
    { name: 'reviewedAt', label: 'Revisado em', type: 'date', admin: { position: 'sidebar' } },
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Dados',
          fields: [
            { name: 'brand', label: 'Marca', type: 'relationship', relationTo: 'brands', required: true },
            {
              name: 'subcategory',
              label: 'Subcategoria',
              type: 'relationship',
              relationTo: 'categories',
              required: true,
              filterOptions: { parent: { exists: true } },
            },
            {
              name: 'images',
              label: 'Imagens',
              type: 'upload',
              relationTo: 'media',
              hasMany: true,
              admin: { description: 'A primeira é a principal.' },
            },
            { name: 'variants', label: 'Variantes', type: 'join', collection: 'variants', on: 'product' },
            { name: 'offers', label: 'Ofertas', type: 'join', collection: 'offers', on: 'product' },
            {
              name: 'specs',
              label: 'Especificações',
              type: 'array',
              admin: { description: 'As linhas vêm do modelo da subcategoria. Salve para atualizar a lista.' },
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
          ],
        },
        {
          label: 'Notas',
          fields: [
            {
              name: 'scores',
              label: 'Notas por critério',
              type: 'array',
              admin: { description: 'De 0 a 10, com uma casa decimal. As linhas vêm dos critérios da subcategoria.' },
              fields: [
                { name: 'key', type: 'text', required: true, admin: { hidden: true } },
                {
                  type: 'row',
                  fields: [
                    { name: 'label', label: 'Critério', type: 'text', admin: { readOnly: true, width: '60%' } },
                    { name: 'score', label: 'Nota', type: 'number', min: 0, max: 10, validate: validateScore, admin: { step: 0.1, width: '40%' } },
                  ],
                },
                { name: 'justification', label: 'Justificativa', type: 'textarea' },
              ],
            },
          ],
        },
        {
          label: 'Análise',
          fields: [
            { name: 'verdict', label: 'Veredito (uma frase)', type: 'text' },
            { name: 'pros', label: 'Pontos positivos', type: 'array', fields: [{ name: 'text', label: 'Texto', type: 'text', required: true }] },
            { name: 'cons', label: 'Pontos negativos', type: 'array', fields: [{ name: 'text', label: 'Texto', type: 'text', required: true }] },
            { name: 'recommendedFor', label: 'Indicado para', type: 'textarea' },
            { name: 'avoidIf', label: 'Evite se', type: 'textarea' },
            { name: 'fullReview', label: 'Análise completa', type: 'richText' },
            {
              name: 'sources',
              label: 'Fontes',
              type: 'array',
              fields: [
                { name: 'title', label: 'Título', type: 'text', required: true },
                { name: 'url', label: 'URL', type: 'text', required: true, validate: httpsUrl() },
              ],
            },
            {
              name: 'faq',
              label: 'Perguntas frequentes',
              type: 'array',
              fields: [
                { name: 'question', label: 'Pergunta', type: 'text', required: true },
                { name: 'answer', label: 'Resposta', type: 'textarea', required: true },
              ],
            },
          ],
        },
        {
          label: 'SEO',
          fields: [
            {
              name: 'seo',
              type: 'group',
              fields: [
                { name: 'metaTitle', label: 'Meta título', type: 'text' },
                {
                  name: 'metaDescription',
                  label: 'Meta descrição',
                  type: 'textarea',
                  admin: { description: '70 a 160 caracteres. Se ficar vazia, o veredito é usado.' },
                },
                { name: 'ogImage', label: 'Imagem de compartilhamento', type: 'upload', relationTo: 'media' },
              ],
            },
          ],
        },
      ],
    },
  ],
}
