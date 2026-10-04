import type { CollectionConfig, Condition } from 'payload'

import { adminOrEditor, anyone } from '../access'
import { slugField } from '../fields/slug'
import { guardCategoryDelete, validateCategory } from './categories/hooks'

const isSubcategory: Condition = (_data, siblingData) => Boolean(siblingData?.parent)

export const Categories: CollectionConfig = {
  slug: 'categories',
  labels: { singular: 'Categoria', plural: 'Categorias' },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'parent', 'isAnchor', 'active'],
    group: 'Catálogo',
    description: 'Categorias (1º nível) e subcategorias (2º nível). Especificações e critérios de nota ficam nas subcategorias.',
  },
  access: { read: anyone, create: adminOrEditor, update: adminOrEditor, delete: adminOrEditor },
  hooks: { beforeChange: [validateCategory], beforeDelete: [guardCategoryDelete] },
  fields: [
    { name: 'name', label: 'Nome', type: 'text', required: true },
    slugField('name'),
    {
      name: 'parent',
      label: 'Categoria-mãe',
      type: 'relationship',
      relationTo: 'categories',
      filterOptions: { parent: { exists: false } },
      admin: { position: 'sidebar', description: 'Vazio = categoria de 1º nível. Preenchido = subcategoria.' },
    },
    { name: 'order', label: 'Ordem', type: 'number', defaultValue: 0, admin: { position: 'sidebar' } },
    { name: 'active', label: 'Ativa', type: 'checkbox', defaultValue: true, admin: { position: 'sidebar' } },
    {
      name: 'isAnchor',
      label: 'Âncora (destaque na home)',
      type: 'checkbox',
      defaultValue: false,
      admin: { position: 'sidebar', condition: isSubcategory },
    },
    { name: 'description', label: 'Descrição (introdução da página)', type: 'textarea' },
    { name: 'icon', label: 'Ícone', type: 'text', admin: { description: 'Um emoji (ex.: 📺) ou nome de ícone.' } },
    {
      name: 'specTemplate',
      label: 'Modelo de especificações',
      type: 'array',
      labels: { singular: 'Atributo', plural: 'Atributos' },
      admin: {
        condition: isSubcategory,
        description: 'Campos que todo produto desta subcategoria terá. A chave não deve mudar depois de criada.',
      },
      fields: [
        {
          type: 'row',
          fields: [
            { name: 'key', label: 'Chave', type: 'text', required: true, admin: { width: '33%', description: 'ex.: taxa_atualizacao' } },
            { name: 'label', label: 'Rótulo', type: 'text', required: true, admin: { width: '33%' } },
            {
              name: 'type',
              label: 'Tipo',
              type: 'select',
              required: true,
              defaultValue: 'text',
              admin: { width: '33%' },
              options: [
                { label: 'Número', value: 'number' },
                { label: 'Texto', value: 'text' },
                { label: 'Sim/Não', value: 'boolean' },
                { label: 'Opção (lista)', value: 'option' },
              ],
            },
          ],
        },
        {
          type: 'row',
          fields: [
            { name: 'unit', label: 'Unidade', type: 'text', admin: { width: '25%' } },
            { name: 'group', label: 'Grupo', type: 'text', admin: { width: '25%', description: 'ex.: Imagem' } },
            {
              name: 'direction',
              label: 'Direção',
              type: 'select',
              defaultValue: 'neutral',
              admin: { width: '50%' },
              options: [
                { label: 'Maior é melhor', value: 'higher' },
                { label: 'Menor é melhor', value: 'lower' },
                { label: 'Neutro', value: 'neutral' },
              ],
            },
          ],
        },
        {
          name: 'options',
          label: 'Opções',
          type: 'text',
          hasMany: true,
          admin: { condition: (_d, sibling) => sibling?.type === 'option' },
        },
        {
          type: 'row',
          fields: [
            { name: 'highlight', label: 'Destaque', type: 'checkbox', defaultValue: false },
            { name: 'comparable', label: 'Comparável', type: 'checkbox', defaultValue: true },
            { name: 'required', label: 'Obrigatório', type: 'checkbox', defaultValue: false },
            { name: 'perVariant', label: 'Varia por variante', type: 'checkbox', defaultValue: false },
          ],
        },
      ],
    },
    {
      name: 'criteria',
      label: 'Critérios de nota',
      type: 'array',
      labels: { singular: 'Critério', plural: 'Critérios' },
      admin: { condition: isSubcategory, description: 'A soma dos pesos precisa ser exatamente 100.' },
      fields: [
        {
          type: 'row',
          fields: [
            { name: 'key', label: 'Chave', type: 'text', required: true, admin: { width: '30%', description: 'ex.: custo_beneficio' } },
            { name: 'name', label: 'Nome', type: 'text', required: true, admin: { width: '45%' } },
            { name: 'weight', label: 'Peso (%)', type: 'number', required: true, min: 0, max: 100, admin: { width: '25%' } },
          ],
        },
        { name: 'description', label: 'Descrição', type: 'textarea' },
      ],
    },
  ],
}
