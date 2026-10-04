import type { CollectionSlug, Payload } from 'payload'

import type { Criterion } from '@/catalog/score'
import type { SpecAttribute } from '@/catalog/spec-template'

export function uid(): string {
  return `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`
}

// Registra o que o teste criou e apaga na ordem inversa
export class Tracker {
  private items: [CollectionSlug, number | string][] = []

  constructor(private payload: Payload) {}

  add<T extends { id: number | string }>(collection: CollectionSlug, doc: T): T {
    this.items.push([collection, doc.id])
    return doc
  }

  async cleanup(): Promise<void> {
    for (const [collection, id] of this.items.reverse()) {
      await this.payload.delete({ collection, id }).catch(() => undefined)
    }
    this.items = []
  }
}

export const sampleSpecTemplate: SpecAttribute[] = [
  { key: 'painel', label: 'Painel', type: 'option', options: ['OLED', 'QLED', 'LED'], required: true, comparable: true, highlight: true },
  { key: 'taxa_atualizacao', label: 'Taxa de atualização', type: 'number', unit: 'Hz', direction: 'higher', comparable: true },
  { key: 'tamanho', label: 'Tamanho', type: 'number', unit: '"', perVariant: true, required: true, comparable: true },
]

export const sampleCriteria: Criterion[] = [
  { key: 'imagem', name: 'Imagem', weight: 60 },
  { key: 'custo_beneficio', name: 'Custo-benefício', weight: 40 },
]

export async function createCategoryPair(
  payload: Payload,
  tracker: Tracker,
  overrides: { specTemplate?: SpecAttribute[]; criteria?: Criterion[] } = {},
) {
  const id = uid()
  const category = tracker.add(
    'categories',
    await payload.create({ collection: 'categories', data: { name: `Categoria ${id}`, slug: `cat-${id}` } }),
  )
  const subcategory = tracker.add(
    'categories',
    await payload.create({
      collection: 'categories',
      data: {
        name: `Sub ${id}`,
        slug: `sub-${id}`,
        parent: category.id,
        specTemplate: overrides.specTemplate ?? sampleSpecTemplate,
        criteria: overrides.criteria ?? sampleCriteria,
      },
    }),
  )
  return { category, subcategory }
}
