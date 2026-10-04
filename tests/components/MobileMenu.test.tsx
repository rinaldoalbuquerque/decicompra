import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { MobileMenu } from '@/components/layout/MobileMenu'
import { mainNav } from '@/config/navigation'

describe('MobileMenu', () => {
  it('começa fechado', () => {
    render(<MobileMenu links={mainNav} />)
    expect(screen.getByRole('button', { name: 'Abrir menu' }).getAttribute('aria-expanded')).toBe('false')
    expect(screen.queryByRole('navigation', { name: 'Menu' })).toBeNull()
  })

  it('abre ao clicar e mostra os links na ordem do menu', () => {
    render(<MobileMenu links={mainNav} />)
    fireEvent.click(screen.getByRole('button', { name: 'Abrir menu' }))

    expect(screen.getByRole('button', { name: 'Fechar menu' }).getAttribute('aria-expanded')).toBe('true')
    const links = screen.getAllByRole('link')
    expect(links.map((a) => a.textContent)).toEqual(mainNav.map((l) => l.label))
    expect(links.map((a) => a.getAttribute('href'))).toEqual(mainNav.map((l) => l.href))
  })

  it('fecha com Esc e devolve o foco ao botão', () => {
    render(<MobileMenu links={mainNav} />)
    fireEvent.click(screen.getByRole('button', { name: 'Abrir menu' }))
    fireEvent.keyDown(document, { key: 'Escape' })

    const button = screen.getByRole('button', { name: 'Abrir menu' })
    expect(button.getAttribute('aria-expanded')).toBe('false')
    expect(document.activeElement).toBe(button)
  })

  it('fecha ao clicar num link', () => {
    render(<MobileMenu links={mainNav} />)
    fireEvent.click(screen.getByRole('button', { name: 'Abrir menu' }))
    fireEvent.click(screen.getByRole('link', { name: 'Guias' }))

    expect(screen.getByRole('button', { name: 'Abrir menu' }).getAttribute('aria-expanded')).toBe('false')
  })
})
