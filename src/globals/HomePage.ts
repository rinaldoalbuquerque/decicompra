import type { GlobalConfig } from 'payload'

import { adminOnly, anyone } from '../access'
import { revalidateHomePage } from './revalidate'

const contentsOfType = (type: string) => ({ type: { equals: type } })

// O que aparece em cada seção da home (spec §4.11 e §6.1)
export const HomePage: GlobalConfig = {
  slug: 'home-page',
  label: 'Página inicial',
  admin: { group: 'Configurações' },
  access: { read: anyone, update: adminOnly },
  hooks: { afterChange: [revalidateHomePage] },
  fields: [
    {
      name: 'heroImage',
      label: 'Imagem do topo (só no computador)',
      type: 'upload',
      relationTo: 'media',
      admin: { description: 'Foto de produtos à direita do título. No celular ela não aparece.' },
    },
    {
      name: 'heroBackground',
      label: 'Imagem de fundo do topo',
      type: 'upload',
      relationTo: 'media',
      admin: {
        description:
          'Foto que cobre todo o fundo do topo (computador e celular). Use foto deitada, de 1920 × 1080 px. Ela fica escurecida para o texto continuar legível.',
      },
    },
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
