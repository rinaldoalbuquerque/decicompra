import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { SiteFooter } from '@/components/layout/SiteFooter'
import { footerColumns } from '@/config/navigation'

describe('SiteFooter', () => {
  it('mostra o slogan e deixa claro que não vendemos produtos', () => {
    render(<SiteFooter year={2026} />)
    const footer = screen.getByRole('contentinfo')
    expect(footer.textContent).toContain('Compare. Entenda. Decida.')
    expect(footer.textContent).toContain('Não vendemos produtos.')
  })

  it.each(footerColumns.map((c) => [c.title, c] as const))('coluna %s tem os links da spec', (title, column) => {
    render(<SiteFooter year={2026} />)
    const nav = screen.getByRole('navigation', { name: title })
    const links = within(nav).getAllByRole('link')
    expect(links.map((a) => [a.textContent, a.getAttribute('href')])).toEqual(
      column.links.map((l) => [l.label, l.href]),
    )
  })

  it('mostra o ano no copyright', () => {
    render(<SiteFooter year={2027} />)
    expect(screen.getByRole('contentinfo').textContent).toContain('© 2027 DeciCompra')
  })

  it('marca o rodapé como superfície escura (anel de foco branco)', () => {
    render(<SiteFooter year={2026} />)
    expect(screen.getByRole('contentinfo').classList.contains('superficie-escura')).toBe(true)
  })

  it('usa as colunas configuradas no painel quando recebidas', () => {
    render(<SiteFooter year={2026} columns={[{ title: 'Ajuda', links: [{ label: 'Contato', href: '/contato/' }] }]} />)
    expect(screen.getByRole('navigation', { name: 'Ajuda' })).toBeDefined()
    expect(screen.queryByRole('navigation', { name: 'Categorias' })).toBeNull()
  })
})
