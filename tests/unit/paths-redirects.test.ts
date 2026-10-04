import { describe, expect, it } from 'vitest'

import { brandPath, categoryPath, contentPath, productPath } from '@/content/paths'
import { planRedirect } from '@/content/redirects'

describe('caminhos públicos (spec §3.2)', () => {
  it('produto, marca e categorias', () => {
    expect(productPath('lg-c4')).toBe('/produtos/lg-c4/')
    expect(brandPath('lg')).toBe('/marcas/lg/')
    expect(categoryPath('tvs-e-entretenimento')).toBe('/tvs-e-entretenimento/')
    expect(categoryPath('smart-tvs', 'tvs-e-entretenimento')).toBe('/tvs-e-entretenimento/smart-tvs/')
  })

  it.each([
    ['melhores', '/melhores/tvs-55/'],
    ['comparativo', '/comparar/tvs-55/'],
    ['guia', '/guias/tvs-55/'],
    ['entenda', '/entenda/tvs-55/'],
  ] as const)('conteúdo do tipo %s', (type, expected) => {
    expect(contentPath(type, 'tvs-55')).toBe(expected)
  })
})

describe('planRedirect', () => {
  const A = '/produtos/a/'
  const B = '/produtos/b/'
  const C = '/produtos/c/'

  it('mesmo caminho não faz nada', () => {
    expect(planRedirect([], A, A)).toEqual({ retarget: [], remove: [] })
  })

  it('cria o redirecionamento simples', () => {
    expect(planRedirect([], A, B)).toEqual({ create: { from: A, to: B }, retarget: [], remove: [] })
  })

  it('evita cadeia: quem apontava para o antigo passa a apontar para o novo', () => {
    expect(planRedirect([{ id: 1, from: A, to: B }], B, C)).toEqual({
      create: { from: B, to: C },
      retarget: [{ id: 1, to: C }],
      remove: [],
    })
  })

  it('voltar ao endereço anterior remove o que viraria loop', () => {
    expect(planRedirect([{ id: 1, from: A, to: B }], B, A)).toEqual({
      create: { from: B, to: A },
      retarget: [],
      remove: [1],
    })
  })

  it('não duplica redirecionamento que já existe', () => {
    expect(planRedirect([{ id: 7, from: A, to: B }], A, B)).toEqual({ retarget: [], remove: [] })
  })
})
