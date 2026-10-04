import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { SiteHeader } from '@/components/layout/SiteHeader'
import { mainNav } from '@/config/navigation'

describe('SiteHeader', () => {
  it('tem o logo apontando para a home', () => {
    render(<SiteHeader />)
    expect(screen.getByRole('link', { name: 'DeciCompra, página inicial' }).getAttribute('href')).toBe('/')
  })

  it('mostra a navegação principal na ordem da spec', () => {
    render(<SiteHeader />)
    const nav = screen.getByRole('navigation', { name: 'Principal' })
    const links = within(nav).getAllByRole('link')
    expect(links.map((a) => a.textContent)).toEqual([
      'Categorias',
      'Melhores',
      'Comparativos',
      'Guias',
      'Entenda',
    ])
    expect(links.map((a) => a.getAttribute('href'))).toEqual(mainNav.map((l) => l.href))
  })

  it('marca o cabeçalho como superfície escura (anel de foco branco)', () => {
    render(<SiteHeader />)
    expect(screen.getByRole('banner').classList.contains('superficie-escura')).toBe(true)
  })
})
