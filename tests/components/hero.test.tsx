import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { Hero } from '@/components/home/Hero'

const image = { src: '/img-640.webp', srcSet: '/img-640.webp 640w, /img-1280.webp 1280w', alt: 'Produtos', width: 1280, height: 800 }

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
