import { BlocksFeature, lexicalEditor } from '@payloadcms/richtext-lexical'
import type { CollectionConfig, Condition } from 'payload'

import { adminOrEditor, loggedIn, readPublicContents, updateContents } from '../access'
import { slugField } from '../fields/slug'
import { httpsUrl } from '../lib/url'
import { contentBlocks } from './contents/blocks'
import { prepareContent, redirectContentSlug } from './contents/hooks'
import { revalidateContent, revalidateDeletedContent } from './revalidation-hooks'

const isType =
  (...types: string[]): Condition =>
  (data) =>
    types.includes(String(data?.type))

// Obrigatório pela validação, não pelo banco: o histórico de versões precisa aceitar produto apagado
const productField = {
  name: 'product',
  label: 'Produto',
  type: 'relationship' as const,
  relationTo: 'products' as const,
  validate: (value: unknown) => (value ? true : 'Escolha o produto.'),
}

export const Contents: CollectionConfig = {
  slug: 'contents',
  labels: { singular: 'Conteúdo', plural: 'Conteúdos' },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'type', 'status', 'publishAt', 'reviewedAt'],
    group: 'Conteúdo',
    description: 'Melhores, Comparativos, Guias e Entenda. Análises de produto ficam no próprio Produto.',
  },
  versions: { maxPerDoc: 30 },
  access: { read: readPublicContents, create: loggedIn, update: updateContents, delete: adminOrEditor },
  hooks: {
    beforeChange: [prepareContent],
    afterChange: [redirectContentSlug, revalidateContent],
    afterDelete: [revalidateDeletedContent],
  },
  fields: [
    { name: 'title', label: 'Título', type: 'text', required: true },
    slugField('title'),
    {
      name: 'type',
      label: 'Tipo',
      type: 'select',
      required: true,
      defaultValue: 'guia',
      admin: { position: 'sidebar' },
      options: [
        { label: 'Melhores', value: 'melhores' },
        { label: 'Comparativo', value: 'comparativo' },
        { label: 'Guia de compra', value: 'guia' },
        { label: 'Entenda', value: 'entenda' },
      ],
    },
    {
      name: 'status',
      label: 'Status',
      type: 'select',
      required: true,
      defaultValue: 'rascunho',
      admin: { position: 'sidebar' },
      options: [
        { label: 'Rascunho', value: 'rascunho' },
        { label: 'Em revisão', value: 'em_revisao' },
        { label: 'Publicado', value: 'publicado' },
        { label: 'Agendado', value: 'agendado' },
      ],
    },
    {
      name: 'publishAt',
      label: 'Publicação',
      type: 'date',
      admin: { position: 'sidebar', date: { pickerAppearance: 'dayAndTime' }, description: 'Preenchida ao publicar. Para agendar, escolha uma data futura.' },
    },
    { name: 'reviewedAt', label: 'Revisado em', type: 'date', admin: { position: 'sidebar' } },
    { name: 'author', label: 'Autor', type: 'relationship', relationTo: 'authors', admin: { position: 'sidebar' } },
    {
      name: 'sponsored',
      label: 'Conteúdo patrocinado',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        position: 'sidebar',
        readOnly: true,
        condition: isType('guia', 'entenda'),
        description: 'Desativado na v1. Nunca permitido em Melhores ou Comparativo.',
      },
    },
    {
      name: 'referencedProducts',
      label: 'Produtos citados',
      type: 'relationship',
      relationTo: 'products',
      hasMany: true,
      admin: { position: 'sidebar', readOnly: true, description: 'Calculado ao salvar.' },
    },
    { name: 'productSetKey', type: 'text', unique: true, index: true, admin: { hidden: true } },
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Conteúdo',
          fields: [
            {
              name: 'primarySubcategory',
              label: 'Subcategoria principal',
              type: 'relationship',
              relationTo: 'categories',
              filterOptions: { parent: { exists: true } },
              admin: { description: 'No comparativo, é definida pelos produtos.' },
            },
            {
              name: 'relatedSubcategories',
              label: 'Subcategorias relacionadas',
              type: 'relationship',
              relationTo: 'categories',
              hasMany: true,
              filterOptions: { parent: { exists: true } },
            },
            { name: 'summary', label: 'Resumo rápido', type: 'textarea', admin: { description: 'A resposta em poucas linhas, no topo da página.' } },
            {
              name: 'body',
              label: 'Texto',
              type: 'richText',
              editor: lexicalEditor({
                features: ({ defaultFeatures }) => [...defaultFeatures, BlocksFeature({ blocks: contentBlocks })],
              }),
            },
          ],
        },
        {
          label: 'Melhores',
          admin: { condition: isType('melhores') },
          fields: [
            { name: 'modelsAnalyzed', label: 'Modelos analisados', type: 'number', min: 0 },
            {
              name: 'picks',
              label: 'Escolhas',
              type: 'array',
              admin: { description: 'De 3 a 10 escolhas, por perfil (ex.: "Melhor custo-benefício").' },
              fields: [
                productField,
                { name: 'variant', label: 'Variante (opcional)', type: 'relationship', relationTo: 'variants' },
                {
                  type: 'row',
                  fields: [
                    { name: 'profileLabel', label: 'Rótulo de perfil', type: 'text', required: true, admin: { width: '70%' } },
                    { name: 'position', label: 'Posição', type: 'number', min: 1, admin: { width: '30%' } },
                  ],
                },
                { name: 'why', label: 'Por que escolhemos', type: 'textarea' },
              ],
            },
            {
              name: 'alsoConsidered',
              label: 'Também consideramos',
              type: 'array',
              fields: [productField, { name: 'reason', label: 'Por que ficou de fora', type: 'textarea' }],
            },
          ],
        },
        {
          label: 'Comparativo',
          admin: { condition: isType('comparativo') },
          fields: [
            {
              name: 'comparedProducts',
              label: 'Produtos comparados',
              type: 'relationship',
              relationTo: 'products',
              hasMany: true,
              admin: { description: '2 ou 3 produtos da mesma subcategoria. O endereço é gerado a partir deles.' },
            },
            {
              name: 'badges',
              label: 'Selos',
              type: 'array',
              fields: [productField, { name: 'label', label: 'Selo', type: 'text', required: true, admin: { description: 'ex.: Vencedora geral' } }],
            },
            {
              name: 'chooseIf',
              label: 'Escolha qual se…',
              type: 'array',
              fields: [productField, { name: 'text', label: 'Frase', type: 'text', required: true }],
            },
            {
              name: 'specOverrides',
              label: 'Ajustes de vencedor por especificação',
              type: 'array',
              fields: [
                { name: 'attributeKey', label: 'Chave do atributo', type: 'text', required: true },
                { name: 'winner', label: 'Vencedor', type: 'relationship', relationTo: 'products' },
                { name: 'noWinner', label: 'Sem vencedor', type: 'checkbox', defaultValue: false },
                { name: 'justification', label: 'Justificativa', type: 'textarea', required: true },
              ],
            },
            { name: 'conclusion', label: 'Conclusão', type: 'textarea' },
          ],
        },
        {
          label: 'Fontes',
          fields: [
            {
              name: 'sources',
              label: 'Fontes',
              type: 'array',
              fields: [
                { name: 'title', label: 'Título', type: 'text', required: true },
                { name: 'url', label: 'URL', type: 'text', required: true, validate: httpsUrl() },
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
                  admin: { description: '70 a 160 caracteres. Se ficar vazia, o resumo é usado.' },
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
