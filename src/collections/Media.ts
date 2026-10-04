import type { CollectionConfig } from 'payload'

import { ALLOWED_IMAGE_TYPES, rejectInvalidUpload, validateAlt, validateCredit } from './media-rules'

const webp = { format: 'webp' as const, options: { quality: 80 } }

export const Media: CollectionConfig = {
  slug: 'media',
  labels: { singular: 'Mídia', plural: 'Mídia' },
  admin: {
    // A Vercel recusa envios acima de ~4,5 MB com erro genérico; avisar antes evita a surpresa
    description: 'Envie imagens JPG, PNG, WebP ou AVIF de até 4 MB. Reduza fotos maiores antes de enviar.',
  },
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
      validate: validateCredit,
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
