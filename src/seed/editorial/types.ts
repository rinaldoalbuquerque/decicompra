import type { SpecAttribute } from '../../catalog/spec-template'
import type { RichTextValue } from '../lexical'

// Pacote editorial (Fase 4): produtos e conteúdos de uma subcategoria, prontos para revisão humana.
// O script cria tudo como rascunho (produtos) ou "em revisão" (conteúdos); imagens e ofertas ficam
// com o responsável.

export type Source = { title: string; url: string }

export type PackVariant = {
  label: string
  voltage?: '127v' | '220v' | 'bivolt'
  modelCode?: string
  isReference?: boolean
  // Atributos por variante (perVariant), pela chave do modelo
  specs: Record<string, string>
}

export type PackProduct = {
  slug: string
  name: string
  brandSlug: string
  variants: PackVariant[]
  // Atributos do produto, pela chave do modelo
  specs: Record<string, string>
  scores: Record<string, { score: number; justification: string }>
  verdict: string
  pros: string[]
  cons: string[]
  recommendedFor: string
  avoidIf: string
  review: RichTextValue
  faq: { question: string; answer: string }[]
  sources: Source[]
}

export type PackContent = {
  type: 'melhores' | 'comparativo' | 'guia' | 'entenda'
  // Comparativo: o slug é gerado pelos produtos
  slug?: string
  title: string
  summary: string
  metaDescription: string
  body?: RichTextValue
  sources: Source[]
  // Melhores
  modelsAnalyzed?: number
  picks?: { productSlug: string; profileLabel: string; position: number; why: string }[]
  alsoConsidered?: { productSlug: string; reason: string }[]
  // Comparativo
  comparedProductSlugs?: string[]
  badges?: { productSlug: string; label: string }[]
  chooseIf?: { productSlug: string; text: string }[]
  conclusion?: string
}

export type EditorialPack = {
  subcategorySlug: string
  // Chaves dos critérios de nota da subcategoria (conferidas no script)
  criteriaKeys: string[]
  specTemplate: SpecAttribute[]
  brands: { slug: string; name: string; officialSite?: string }[]
  products: PackProduct[]
  contents: PackContent[]
}
