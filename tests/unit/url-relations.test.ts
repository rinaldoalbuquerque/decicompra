import { describe, expect, it } from 'vitest'

import { pick, relId } from '@/lib/relations'
import { httpsUrl, isHttpsUrl } from '@/lib/url'

describe('isHttpsUrl / httpsUrl', () => {
  it('aceita só https completo', () => {
    expect(isHttpsUrl('https://www.amazon.com.br/dp/X')).toBe(true)
    expect(isHttpsUrl('http://www.amazon.com.br')).toBe(false)
    expect(isHttpsUrl('www.amazon.com.br')).toBe(false)
    expect(isHttpsUrl(undefined)).toBe(false)
  })

  it('validador obrigatório e opcional', () => {
    const required = httpsUrl() as (v: unknown) => true | string
    const optional = httpsUrl({ optional: true }) as (v: unknown) => true | string
    expect(required('https://a.com')).toBe(true)
    expect(required('')).toBe('Informe uma URL completa começando com https://')
    expect(optional('')).toBe(true)
    expect(optional('ftp://a.com')).toBe('Informe uma URL completa começando com https://')
  })
})

describe('relId', () => {
  it.each([
    [5, 5],
    ['7', '7'],
    [{ id: 9, name: 'x' }, 9],
    [null, null],
    [undefined, null],
    ['', null],
  ])('%j → %j', (input, expected) => {
    expect(relId(input)).toBe(expected)
  })
})

describe('pick', () => {
  it('prefere o dado novo, inclusive null, e cai no original quando a chave não veio', () => {
    expect(pick({ a: 1 }, { a: 2 }, 'a')).toBe(1)
    expect(pick({ a: null }, { a: 2 }, 'a')).toBeNull()
    expect(pick({}, { a: 2 }, 'a')).toBe(2)
    expect(pick(undefined, undefined, 'a')).toBeUndefined()
  })
})
