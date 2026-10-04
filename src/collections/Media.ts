import type { CollectionConfig } from 'payload'

import { ALLOWED_IMAGE_TYPES, rejectInvalidUpload, validateAlt } from './media-rules'

const webp = { format: 'webp' as const, options: { quality: 80 } }

export const Media: CollectionConfig = {
  slug: 'media',
  labels: { singular: 'Mídia', plural: 'Mídia' },
  access: { read: () => true },
  hooks: { beforeOperation: [rejectInvalidUpload] },
  fields: [
    {
      name: 'alt',
      label: 'Texto alternativo',
      type: 'text',
      required: true,
      validate: validateAlt,
      admin: { description: 'Descreva a imagem para quem não pode vê-la (acessibilidade e SEO).' },
    },
    {
      name: 'credit',
      label: 'Crédito / fonte',
      type: 'text',
      required: true,
      admin: { description: 'Ex.: "Divulgação LG". Use só imagens oficiais de imprensa ou com permissão.' },
    },
  ],
  upload: {
    mimeTypes: ALLOWED_IMAGE_TYPES,
    imageSizes: [
      { name: 'thumb', width: 320, formatOptions: webp },
      { name: 'card', width: 640, formatOptions: webp },
      { name: 'large', width: 1280, formatOptions: webp },
    ],
  },
}
