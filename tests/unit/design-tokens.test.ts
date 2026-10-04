import { readFileSync } from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

import { contrastRatio } from '@/design/contrast'
import { colors, type ColorToken } from '@/design/tokens'

describe('contrastRatio', () => {
  it('preto sobre branco = 21', () => {
    expect(contrastRatio('#000000', '#FFFFFF')).toBeCloseTo(21, 1)
  })

  it('mesma cor = 1', () => {
    expect(contrastRatio('#2563EB', '#2563EB')).toBeCloseTo(1, 5)
  })

  it('aceita hexadecimal minúsculo e é simétrico', () => {
    expect(contrastRatio('#172554', '#ffffff')).toBeCloseTo(contrastRatio('#FFFFFF', '#172554'), 5)
  })
})

describe('tokens de cor (spec §7.1)', () => {
  const textPairs: [ColorToken, ColorToken][] = [
    ['texto', 'branco'],
    ['texto-suave', 'branco'],
    ['texto-suave', 'cinza-claro'],
    ['branco', 'azul-profundo'],
    ['branco', 'azul-eletrico'],
    ['azul-eletrico', 'branco'],
    ['branco', 'verde-texto'],
    ['verde-texto', 'branco'],
    ['negativo', 'branco'],
  ]

  it.each(textPairs)('%s sobre %s atinge AA para texto normal (4,5:1)', (fg, bg) => {
    expect(contrastRatio(colors[fg], colors[bg])).toBeGreaterThanOrEqual(4.5)
  })

  it('verde (#16A34A) com texto branco NÃO atinge 4,5:1, e por isso existe o verde-texto', () => {
    expect(contrastRatio(colors.branco, colors.verde)).toBeLessThan(4.5)
  })

  it('verde sobre azul-profundo atinge AA para texto grande (3:1), como no "Decida." da home', () => {
    expect(contrastRatio(colors.verde, colors['azul-profundo'])).toBeGreaterThanOrEqual(3)
  })

  it('globals.css declara exatamente os mesmos valores do tokens.ts', () => {
    const css = readFileSync(path.resolve(process.cwd(), 'src/app/(frontend)/globals.css'), 'utf8').toLowerCase()
    for (const [name, hex] of Object.entries(colors)) {
      expect(css).toContain(`--color-${name}: ${hex.toLowerCase()};`)
    }
  })

  it('anel de foco: azul-eletrico sobre fundo claro e branco sobre fundo escuro atingem 3:1 (WCAG 1.4.11)', () => {
    expect(contrastRatio(colors['azul-eletrico'], colors.branco)).toBeGreaterThanOrEqual(3)
    expect(contrastRatio(colors.branco, colors['azul-profundo'])).toBeGreaterThanOrEqual(3)
    expect(contrastRatio(colors['azul-eletrico'], colors['azul-profundo'])).toBeLessThan(3)
  })

  it('globals.css usa anel de foco branco nas superfícies escuras', () => {
    const css = readFileSync(path.resolve(process.cwd(), 'src/app/(frontend)/globals.css'), 'utf8')
    expect(css).toMatch(/:focus-visible\s*\{[^}]*outline:\s*3px solid var\(--focus-ring, var\(--color-azul-eletrico\)\)/)
    expect(css).toMatch(/\.superficie-escura\s*\{[^}]*--focus-ring:\s*var\(--color-branco\)/)
  })
})
