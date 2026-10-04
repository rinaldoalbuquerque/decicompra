import { describe, expect, it } from 'vitest'

import { footerColumns, mainNav, resolveNavigation } from '@/config/navigation'

describe('resolveNavigation', () => {
  it('sem configuração usa o menu e o rodapé padrão', () => {
    expect(resolveNavigation(null)).toEqual({ mainNav, footerColumns })
    expect(resolveNavigation({ mainNav: [], footerColumns: [] })).toEqual({ mainNav, footerColumns })
  })

  it('usa o que foi configurado e completa o que faltar com o padrão', () => {
    const custom = [{ label: 'Ofertas', href: '/ofertas/' }]
    expect(resolveNavigation({ mainNav: custom, footerColumns: null })).toEqual({ mainNav: custom, footerColumns })
  })

  it('ignora itens incompletos e colunas sem links', () => {
    const result = resolveNavigation({
      mainNav: [{ label: 'Guias', href: '/guias/' }, { label: '', href: '/x/' }, { label: 'Sem link', href: '' }],
      footerColumns: [
        { title: 'Sobre', links: [{ label: 'Quem somos', href: '/sobre/' }] },
        { title: 'Vazia', links: [] },
      ],
    })
    expect(result.mainNav).toEqual([{ label: 'Guias', href: '/guias/' }])
    expect(result.footerColumns).toEqual([{ title: 'Sobre', links: [{ label: 'Quem somos', href: '/sobre/' }] }])
  })
})
