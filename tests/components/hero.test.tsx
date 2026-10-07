import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { Hero } from '@/components/home/Hero'

const image = { src: '/img-640.webp', srcSet: '/img-640.webp 640w, /img-1280.webp 1280w', alt: 'Produtos', width: 1280, height: 800 }
const background = { src: '/fundo-1280.webp', srcSet: '/fundo-640.webp 640w, /fundo-1280.webp 1280w', alt: 'Cozinha', width: 1280, height: 720 }

describe('Hero: imagem só no computador', () => {
  it('a imagem real só é oferecida para telas largas; no celular nada é baixado', () => {
    const { container } = render(<Hero chips={[]} image={image} />)
    const source = container.querySelector('picture source')
    expect(source?.getAttribute('media')).toBe('(min-width: 1024px)')
    expect(source?.getAttribute('srcset')).toBe(image.srcSet)
    const img = container.querySelector('picture img')
    expect(img?.getAttribute('src')).toMatch(/^data:image\/gif;base64,/)
    expect(img?.getAttribute('alt')).toBe('Produtos')
  })
})

describe('Hero: busca, atalhos e fundo', () => {
  it('o campo de busca é azul translúcido com texto branco sem borda nem contorno branco ao focar', () => {
    render(<Hero chips={[]} image={null} />)
    const classes = screen.getByRole('searchbox', { name: 'Buscar' }).className.split(/\s+/)
    expect(classes).toEqual(expect.arrayContaining(['bg-azul-profundo/50', 'backdrop-blur-sm', 'border', 'border-white/30', 'focus:outline-none', 'focus-visible:outline-none', 'focus:bg-azul-profundo/70', 'text-branco', 'placeholder:text-blue-200']))
    expect(classes).not.toContain('bg-branco')
    expect(classes).not.toContain('text-texto')
    expect(classes).not.toContain('focus:border-branco')
  })

  it('os três atalhos usam ícones desenhados (SVG), não emojis', () => {
    render(<Hero chips={[]} image={null} />)
    const nav = screen.getByRole('navigation', { name: 'Atalhos' })
    const links = nav.querySelectorAll('a')
    expect(links).toHaveLength(3)
    for (const link of links) {
      expect(link.querySelector('svg')).not.toBeNull()
      expect(link.textContent).not.toMatch(/\p{Extended_Pictographic}/u)
    }
  })

  it('imagem de fundo opcional, decorativa, atrás de uma camada que mantém o texto legível', () => {
    const { container, rerender } = render(<Hero chips={[]} image={null} background={background} />)
    const bg = container.querySelector('[data-hero-background] img')
    expect(bg?.getAttribute('srcset')).toBe(background.srcSet)
    expect(bg?.getAttribute('alt')).toBe('')
    expect(container.querySelector('[data-hero-background]')?.getAttribute('aria-hidden')).toBe('true')
    expect(container.querySelector('[data-hero-overlay]')).not.toBeNull()

    rerender(<Hero chips={[]} image={null} background={null} />)
    expect(container.querySelector('[data-hero-background]')).toBeNull()
  })
})
