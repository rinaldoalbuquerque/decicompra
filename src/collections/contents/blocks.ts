import type { Block } from 'payload'

// Blocos do texto rico (spec §4.9). Os que mostram produtos guardam só a referência;
// nome, nota, preço e link são lidos do Produto e da Oferta na hora de gerar a página.
export const contentBlocks: Block[] = [
  {
    slug: 'productCard',
    labels: { singular: 'Card de produto', plural: 'Cards de produto' },
    fields: [{ name: 'product', label: 'Produto', type: 'relationship', relationTo: 'products', required: true }],
  },
  {
    slug: 'offerButton',
    labels: { singular: 'Botão de oferta', plural: 'Botões de oferta' },
    fields: [
      { name: 'product', label: 'Produto', type: 'relationship', relationTo: 'products', required: true },
      {
        name: 'store',
        label: 'Loja (opcional)',
        type: 'relationship',
        relationTo: 'stores',
        admin: { description: 'Vazio: mostra as lojas com oferta ativa da variante de referência.' },
      },
    ],
  },
  {
    slug: 'comparisonTable',
    labels: { singular: 'Tabela comparativa', plural: 'Tabelas comparativas' },
    fields: [
      {
        name: 'products',
        label: 'Produtos (2 a 5, da mesma subcategoria)',
        type: 'relationship',
        relationTo: 'products',
        hasMany: true,
        required: true,
        minRows: 2,
        maxRows: 5,
      },
      {
        name: 'attributes',
        label: 'Atributos (chaves)',
        type: 'text',
        hasMany: true,
        admin: { description: 'Vazio: usa todos os atributos comparáveis da subcategoria.' },
      },
    ],
  },
  {
    slug: 'sideBySide',
    labels: { singular: 'Lado a lado', plural: 'Lado a lado' },
    fields: [
      {
        type: 'row',
        fields: [
          { name: 'leftTitle', label: 'Título da esquerda', type: 'text', required: true, admin: { width: '50%' } },
          { name: 'rightTitle', label: 'Título da direita', type: 'text', required: true, admin: { width: '50%' } },
        ],
      },
      {
        type: 'row',
        fields: [
          { name: 'leftText', label: 'Texto da esquerda', type: 'textarea', required: true, admin: { width: '50%' } },
          { name: 'rightText', label: 'Texto da direita', type: 'textarea', required: true, admin: { width: '50%' } },
        ],
      },
    ],
  },
  {
    slug: 'tip',
    labels: { singular: 'Dica/Aviso', plural: 'Dicas/Avisos' },
    fields: [
      {
        name: 'kind',
        label: 'Tipo',
        type: 'select',
        required: true,
        defaultValue: 'dica',
        options: [
          { label: 'Dica', value: 'dica' },
          { label: 'Aviso', value: 'aviso' },
        ],
      },
      { name: 'text', label: 'Texto', type: 'textarea', required: true },
    ],
  },
  {
    slug: 'faq',
    labels: { singular: 'Perguntas frequentes', plural: 'Perguntas frequentes' },
    fields: [
      {
        name: 'items',
        label: 'Perguntas',
        type: 'array',
        minRows: 1,
        fields: [
          { name: 'question', label: 'Pergunta', type: 'text', required: true },
          { name: 'answer', label: 'Resposta', type: 'textarea', required: true },
        ],
      },
    ],
  },
  {
    slug: 'contentImage',
    labels: { singular: 'Imagem', plural: 'Imagens' },
    fields: [
      { name: 'image', label: 'Imagem', type: 'upload', relationTo: 'media', required: true },
      { name: 'caption', label: 'Legenda', type: 'text' },
    ],
  },
  {
    slug: 'simpleTable',
    labels: { singular: 'Tabela simples', plural: 'Tabelas simples' },
    fields: [
      { name: 'header', label: 'Cabeçalho', type: 'text', hasMany: true },
      { name: 'rows', label: 'Linhas', type: 'array', fields: [{ name: 'cells', label: 'Células', type: 'text', hasMany: true }] },
    ],
  },
]
