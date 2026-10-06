import type { CollectionConfig, TextFieldSingleValidation } from 'payload'

import { adminOrEditor, anyone } from '../access'
import { preventRedirectLoop, revalidateDeletedRedirect, revalidateRedirect } from './redirects/hooks'

const validatePath: TextFieldSingleValidation = (value) =>
  typeof value === 'string' && /^\/\S*\/$/.test(value) ? true : 'Use um caminho que comece e termine com "/" (ex.: /produtos/lg-c4/).'

export const Redirects: CollectionConfig = {
  slug: 'redirects',
  labels: { singular: 'Redirecionamento', plural: 'Redirecionamentos' },
  admin: {
    useAsTitle: 'from',
    defaultColumns: ['from', 'to', 'auto'],
    group: 'Sistema',
    description: 'Endereços antigos que levam para os novos (301). Criados automaticamente quando um slug público muda.',
  },
  access: { read: anyone, create: adminOrEditor, update: adminOrEditor, delete: adminOrEditor },
  hooks: { beforeChange: [preventRedirectLoop], afterChange: [revalidateRedirect], afterDelete: [revalidateDeletedRedirect] },
  fields: [
    { name: 'from', label: 'De', type: 'text', required: true, unique: true, index: true, validate: validatePath },
    { name: 'to', label: 'Para', type: 'text', required: true, validate: validatePath },
    {
      name: 'type',
      label: 'Tipo',
      type: 'select',
      required: true,
      defaultValue: '301',
      options: [{ label: '301 (permanente)', value: '301' }],
    },
    {
      name: 'auto',
      label: 'Criado automaticamente',
      type: 'checkbox',
      defaultValue: false,
      admin: { readOnly: true, position: 'sidebar' },
    },
  ],
}
