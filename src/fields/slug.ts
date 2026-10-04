import type { TextField, TextFieldSingleValidation } from 'payload'

import { SLUG_PATTERN, slugify } from '../lib/slug'

const validateSlug: TextFieldSingleValidation = (value) =>
  typeof value === 'string' && SLUG_PATTERN.test(value)
    ? true
    : 'Slug inválido: use letras minúsculas, números e hífens.'

export function slugField(source = 'name'): TextField {
  return {
    name: 'slug',
    label: 'Slug (endereço)',
    type: 'text',
    // Não é 'required' no esquema porque o hook o gera a partir do nome; o validador recusa vazio
    unique: true,
    index: true,
    validate: validateSlug,
    admin: {
      position: 'sidebar',
      description: 'Gerado a partir do nome se ficar vazio. Só letras minúsculas, números e hífens.',
    },
    hooks: {
      beforeValidate: [
        ({ value, siblingData, data }) => {
          const typed = typeof value === 'string' ? value.trim() : ''
          if (typed) return slugify(typed)
          const sourceValue = (siblingData?.[source] ?? data?.[source]) as unknown
          return typeof sourceValue === 'string' ? slugify(sourceValue) : value
        },
      ],
    },
  }
}
