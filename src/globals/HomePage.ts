import type { GlobalConfig } from 'payload'

import { adminOnly, anyone } from '../access'

const contentsOfType = (type: string) => ({ type: { equals: type } })

// O que aparece em cada seção da home (spec §4.11 e §6.1)
export const HomePage: GlobalConfig = {
  slug: 'home-page',
  label: 'Página inicial',
  admin: { group: 'Configurações' },
  access: { read: anyone, update: adminOnly },
  fields: [
    {
      name: 'searchChips',
      label: 'Sugestões abaixo da busca',
      type: 'array',
      maxRows: 8,
      fields: [
        {
          type: 'row',
          fields: [
            { name: 'label', label: 'Texto', type: 'text', required: true, admin: { width: '50%' } },
            { name: 'href', label: 'Endereço', type: 'text', required: true, admin: { width: '50%' } },
          ],
        },
      ],
    },
    {
      name: 'subcategoryCards',
      label: '"O que você está procurando?" (subcategorias)',
      type: 'relationship',
      relationTo: 'categories',
      hasMany: true,
      maxRows: 12,
      filterOptions: { parent: { exists: true } },
    },
    {
      name: 'featuredComparisons',
      label: 'Comparativos em destaque',
      type: 'relationship',
      relationTo: 'contents',
      hasMany: true,
      maxRows: 6,
      filterOptions: contentsOfType('comparativo'),
    },
    {
      name: 'featuredBest',
      label: 'Melhores do momento',
      type: 'relationship',
      relationTo: 'contents',
      hasMany: true,
      maxRows: 8,
      filterOptions: contentsOfType('melhores'),
    },
    {
      name: 'featuredGuides',
      label: 'Guias de compra em destaque',
      type: 'relationship',
      relationTo: 'contents',
      hasMany: true,
      maxRows: 6,
      filterOptions: contentsOfType('guia'),
    },
    {
      name: 'featuredExplainers',
      label: '"Entenda antes de comprar"',
      type: 'relationship',
      relationTo: 'contents',
      hasMany: true,
      maxRows: 6,
      filterOptions: contentsOfType('entenda'),
    },
  ],
}
