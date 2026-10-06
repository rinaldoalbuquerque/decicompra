import { describe, expect, it } from 'vitest'

import { validateSpecTemplate, validateSpecValue } from '@/catalog/spec-template'
import { EDITORIAL_PACKS } from '@/seed/editorial'

// Cada pacote precisa sair do script pronto para revisão: tudo o que o checklist de publicação
// (spec §5.7) exige, menos as imagens e as ofertas, que dependem do responsável.
describe.each(Object.entries(EDITORIAL_PACKS))('pacote editorial %s', (_name, pack) => {
  const productSlugs = new Set(pack.products.map((product) => product.slug))

  it('modelo de especificações válido', () => {
    expect(validateSpecTemplate(pack.specTemplate)).toEqual([])
  })

  it.each(pack.products.map((product) => [product.slug, product] as const))('produto %s completo para análise', (_slug, product) => {
    expect(product.verdict.length).toBeGreaterThanOrEqual(70)
    expect(product.verdict.length).toBeLessThanOrEqual(160)
    expect(product.pros.length).toBeGreaterThanOrEqual(3)
    expect(product.pros.length).toBeLessThanOrEqual(6)
    expect(product.cons.length).toBeGreaterThanOrEqual(2)
    expect(product.cons.length).toBeLessThanOrEqual(5)
    expect(product.sources.length).toBeGreaterThanOrEqual(1)
    for (const source of product.sources) expect(source.url).toMatch(/^https:\/\//)
    expect(Object.keys(product.scores).sort()).toEqual([...pack.criteriaKeys].sort())
    for (const { score, justification } of Object.values(product.scores)) {
      expect(score).toBeGreaterThanOrEqual(0)
      expect(score).toBeLessThanOrEqual(10)
      expect(justification.length).toBeGreaterThan(20)
    }
    expect(product.variants.length).toBeGreaterThanOrEqual(1)
    expect(product.variants.filter((variant) => variant.isReference)).toHaveLength(1)
    // Atributos obrigatórios preenchidos e valores no formato do modelo
    for (const attr of pack.specTemplate) {
      const values = attr.perVariant ? product.variants.map((variant) => variant.specs[attr.key]) : [product.specs[attr.key]]
      for (const value of values) {
        if (attr.required) expect(value, `${product.slug}: ${attr.key}`).toBeTruthy()
        if (value) expect(validateSpecValue(attr, value), `${product.slug}: ${attr.key}`).toBeNull()
      }
    }
  })

  it.each(pack.contents.map((content) => [content.title, content] as const))('conteúdo "%s" completo', (_title, content) => {
    expect(content.summary.trim()).not.toBe('')
    expect(content.metaDescription.length).toBeGreaterThanOrEqual(70)
    expect(content.metaDescription.length).toBeLessThanOrEqual(160)
    expect(content.sources.length).toBeGreaterThanOrEqual(1)
    if (content.type === 'melhores') {
      expect(content.picks!.length).toBeGreaterThanOrEqual(3)
      for (const pick of content.picks!) expect(productSlugs.has(pick.productSlug)).toBe(true)
    }
    if (content.type === 'comparativo') {
      expect(content.comparedProductSlugs!.length).toBeGreaterThanOrEqual(2)
      for (const slug of content.comparedProductSlugs!) expect(productSlugs.has(slug)).toBe(true)
    }
  })

  it('tem os 4 tipos de conteúdo da Fase 4 e ao menos 3 produtos', () => {
    expect(pack.products.length).toBeGreaterThanOrEqual(3)
    expect(new Set(pack.contents.map((content) => content.type))).toEqual(new Set(['melhores', 'comparativo', 'guia', 'entenda']))
  })
})
