import { act, fireEvent, render, screen, within } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { CategoriesMenu } from '@/components/layout/CategoriesMenu'
import { SearchBox } from '@/components/layout/SearchBox'
import { SiteHeader } from '@/components/layout/SiteHeader'
import { mainNav } from '@/config/navigation'

// Endereço atual controlado pelo teste (a home esconde só a busca do cabeçalho do computador)
const navigation = vi.hoisted(() => ({ pathname: '/produtos/x/' }))
vi.mock('next/navigation', () => ({ usePathname: () => navigation.pathname, useRouter: () => ({ push: vi.fn() }) }))

const suggestions = {
  groups: [
    { type: 'products', label: 'Produtos', items: [{ title: 'TV Demo Alfa', href: '/produtos/demo-tv-alfa/' }] },
    { type: 'comparisons', label: 'Comparativos', items: [{ title: 'Alfa vs Beta', href: '/comparar/a-vs-b/' }] },
  ],
}

describe('SearchBox', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => ({ ok: true, json: async () => suggestions })),
    )
  })
  afterEach(() => {
    vi.useRealTimers()
    vi.unstubAllGlobals()
  })

  it('é um formulário GET para /busca/ com o campo q', () => {
    render(<SearchBox />)
    const input = screen.getByRole('combobox', { name: 'Buscar no DeciCompra' })
    expect(input.getAttribute('name')).toBe('q')
    const form = input.closest('form')!
    expect(form.getAttribute('action')).toBe('/busca/')
    expect(form.getAttribute('method')).toBe('get')
  })

  it('com 2+ letras busca sugestões (após a espera) e mostra agrupadas', async () => {
    render(<SearchBox />)
    const input = screen.getByRole('combobox', { name: 'Buscar no DeciCompra' })
    fireEvent.change(input, { target: { value: 'a' } })
    await act(async () => {
      await vi.advanceTimersByTimeAsync(300)
    })
    expect(fetch).not.toHaveBeenCalled()

    fireEvent.change(input, { target: { value: 'alf' } })
    await act(async () => {
      await vi.advanceTimersByTimeAsync(300)
    })
    expect(fetch).toHaveBeenCalledTimes(1)
    expect(String((fetch as unknown as { mock: { calls: unknown[][] } }).mock.calls[0][0])).toBe('/busca/sugestoes/?q=alf')
    const listbox = screen.getByRole('listbox')
    expect(within(listbox).getByText('Produtos')).toBeTruthy()
    expect(within(listbox).getAllByRole('option').map((o) => o.textContent)).toEqual(['TV Demo Alfa', 'Alfa vs Beta'])
    expect(input.getAttribute('aria-expanded')).toBe('true')
  })

  it('setas movem a seleção e Esc fecha', async () => {
    render(<SearchBox />)
    const input = screen.getByRole('combobox', { name: 'Buscar no DeciCompra' })
    fireEvent.change(input, { target: { value: 'alf' } })
    await act(async () => {
      await vi.advanceTimersByTimeAsync(300)
    })
    fireEvent.keyDown(input, { key: 'ArrowDown' })
    fireEvent.keyDown(input, { key: 'ArrowDown' })
    const options = screen.getAllByRole('option')
    expect(options[1].getAttribute('aria-selected')).toBe('true')
    expect(input.getAttribute('aria-activedescendant')).toBe(options[1].id)
    fireEvent.keyDown(input, { key: 'Escape' })
    expect(screen.queryByRole('listbox')).toBeNull()
  })
})

describe('SearchBox: home, mouse e leitor de tela', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => ({ ok: true, json: async () => suggestions })),
    )
  })
  afterEach(() => {
    vi.useRealTimers()
    vi.unstubAllGlobals()
    navigation.pathname = '/produtos/x/'
  })

  it('na home só a busca do cabeçalho (computador) fica escondida; a do menu do celular aparece', () => {
    navigation.pathname = '/'
    const { container } = render(
      <>
        <SearchBox hideOnHomeUntilScroll />
        <SearchBox />
      </>,
    )
    const forms = container.querySelectorAll('form')
    expect(forms[0].className).toContain('invisible')
    expect(forms[1].className).not.toContain('invisible')
  })

  it('opções fora da ordem de Tab, clique não fecha a lista antes de navegar e contagem anunciada', async () => {
    render(<SearchBox />)
    fireEvent.change(screen.getByRole('combobox', { name: 'Buscar no DeciCompra' }), { target: { value: 'alf' } })
    await act(async () => {
      await vi.advanceTimersByTimeAsync(300)
    })
    const options = screen.getAllByRole('option')
    expect(options.every((option) => option.getAttribute('tabindex') === '-1')).toBe(true)
    // mousedown cancelado = o campo não perde o foco e a lista continua aberta até o clique
    expect(fireEvent.mouseDown(options[0])).toBe(false)
    expect(screen.getByRole('status').textContent).toBe('2 sugestões')
  })
})

describe('CategoriesMenu', () => {
  const categories = [
    { id: 1, slug: 'tvs', name: 'TVs', description: null, icon: null, subcategories: [{ id: 2, slug: 'smart-tvs', name: 'Smart TVs', description: null, icon: null, publicItems: 3 }] },
  ]

  it('botão abre o painel com as categorias recebidas e "Ver todas"', () => {
    render(<CategoriesMenu label="Categorias" categories={categories} />)
    const button = screen.getByRole('button', { name: 'Categorias' })
    expect(button.getAttribute('aria-expanded')).toBe('false')
    fireEvent.click(button)
    expect(button.getAttribute('aria-expanded')).toBe('true')
    expect(screen.getByRole('link', { name: 'TVs' }).getAttribute('href')).toBe('/tvs/')
    expect(screen.getByRole('link', { name: 'Smart TVs' }).getAttribute('href')).toBe('/tvs/smart-tvs/')
    expect(screen.getByRole('link', { name: 'Ver todas as categorias' }).getAttribute('href')).toBe('/categorias/')
  })

  it('no cabeçalho, "Categorias" vira o botão quando há categorias', () => {
    render(<SiteHeader links={mainNav} categories={categories} />)
    const nav = screen.getByRole('navigation', { name: 'Principal' })
    expect(within(nav).getByRole('button', { name: 'Categorias' })).toBeTruthy()
    expect(within(nav).getAllByRole('link').map((a) => a.textContent)).toEqual(['Melhores', 'Comparativos', 'Guias', 'Entenda'])
  })
})
