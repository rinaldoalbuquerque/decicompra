import { describe, expect, it } from 'vitest'

import { pageCount, pageHref, parsePage } from '@/content/pagination'
import { isBrandIndexable } from '@/content/visibility'

describe('paginação', () => {
  it('lê ?pagina=N', () => {
    expect(parsePage('2')).toBe(2)
    expect(parsePage('15')).toBe(15)
  })

  it('valores ausentes ou estranhos viram a página 1', () => {
    for (const value of [undefined, '', '0', '-1', 'abc', '2.5', '1e3', ' 3', '99999999999999999999', ['2', '3']]) {
      expect(parsePage(value as never)).toBe(1)
    }
  })

  it('conta páginas de 24 (mínimo 1)', () => {
    expect(pageCount(0)).toBe(1)
    expect(pageCount(24)).toBe(1)
    expect(pageCount(25)).toBe(2)
    expect(pageCount(10, 5)).toBe(2)
  })

  it('a página 1 sai sem ?pagina e o filtro é preservado em ordem estável', () => {
    expect(pageHref('/melhores/', 1)).toBe('/melhores/')
    expect(pageHref('/melhores/', 3)).toBe('/melhores/?pagina=3')
    expect(pageHref('/guias/', 1, { categoria: 'tecnologia' })).toBe('/guias/?categoria=tecnologia')
    expect(pageHref('/guias/', 2, { categoria: 'tecnologia' })).toBe('/guias/?categoria=tecnologia&pagina=2')
    expect(pageHref('/guias/', 2, { categoria: '' })).toBe('/guias/?pagina=2')
  })
})

describe('indexação de marca', () => {
  it('só com 3 ou mais itens públicos', () => {
    expect(isBrandIndexable(2)).toBe(false)
    expect(isBrandIndexable(3)).toBe(true)
  })
})
