import { describe, expect, it } from 'vitest'

import { slugField } from '@/fields/slug'
import { SLUG_PATTERN, slugify } from '@/lib/slug'

describe('slugify', () => {
  it.each([
    ['TVs & Entretenimento', 'tvs-e-entretenimento'],
    ['Casa & Eletrodomésticos', 'casa-e-eletrodomesticos'],
    ['Air Fryers', 'air-fryers'],
    ['LG C4 OLED 55"', 'lg-c4-oled-55'],
    ['  --Olá, Mundo!--  ', 'ola-mundo'],
    ['Ar-condicionado', 'ar-condicionado'],
  ])('%s → %s', (input, expected) => {
    expect(slugify(input)).toBe(expected)
    expect(SLUG_PATTERN.test(expected)).toBe(true)
  })
})

describe('slugField', () => {
  const field = slugField('name')
  const hook = field.hooks!.beforeValidate![0] as (args: Record<string, unknown>) => unknown
  const validate = field.validate as (value: unknown) => true | string

  it('gera o slug a partir do nome quando vazio', () => {
    expect(hook({ value: '', siblingData: { name: 'Air Fryers' } })).toBe('air-fryers')
  })

  it('normaliza o slug digitado', () => {
    expect(hook({ value: 'Minha Slug Ç', siblingData: { name: 'x' } })).toBe('minha-slug-c')
  })

  it('valida o formato', () => {
    expect(validate('air-fryers')).toBe(true)
    expect(validate('Air Fryers')).toBe('Slug inválido: use letras minúsculas, números e hífens.')
    expect(validate('')).toBe('Slug inválido: use letras minúsculas, números e hífens.')
  })
})
