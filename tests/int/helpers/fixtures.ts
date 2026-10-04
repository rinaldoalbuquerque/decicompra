import type { CollectionSlug, Payload } from 'payload'
import sharp from 'sharp'

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

export async function createBrand(payload: Payload, tracker: Tracker) {
  const id = uid()
  return tracker.add('brands', await payload.create({ collection: 'brands', data: { name: `Marca ${id}`, slug: `marca-${id}` } }))
}

export async function createStore(payload: Payload, tracker: Tracker, data: { active?: boolean } = {}) {
  const id = uid()
  return tracker.add(
    'stores',
    await payload.create({ collection: 'stores', data: { name: `Loja ${id}`, slug: `loja-${id}`, active: data.active ?? true } }),
  )
}

export async function createImage(payload: Payload, tracker: Tracker) {
  const data = await sharp({ create: { width: 400, height: 300, channels: 3, background: '#2563EB' } }).png().toBuffer()
  return tracker.add(
    'media',
    await payload.create({
      collection: 'media',
      data: { alt: 'Imagem de teste', credit: 'Teste automatizado' },
      file: { data, mimetype: 'image/png', name: `teste-${uid()}.png`, size: data.length },
    }),
  )
}

export async function createProduct(
  payload: Payload,
  tracker: Tracker,
  refs: { subcategoryId: number; brandId: number },
) {
  const id = uid()
  return tracker.add(
    'products',
    await payload.create({
      collection: 'products',
      data: { name: `Produto ${id}`, slug: `produto-${id}`, brand: refs.brandId, subcategory: refs.subcategoryId, status: 'rascunho' },
    }),
  )
}

// Preenche o mínimo para status "ficha" com sampleSpecTemplate e sampleCriteria
export async function makePublishable(payload: Payload, productId: number, imageId: number) {
  const { docs } = await payload.find({ collection: 'variants', where: { product: { equals: productId } }, limit: 10 })
  for (const variant of docs) {
    await payload.update({ collection: 'variants', id: variant.id, data: { specs: [{ key: 'tamanho', value: '55' }] } })
  }
  return payload.update({
    collection: 'products',
    id: productId,
    data: {
      images: [imageId],
      specs: [{ key: 'painel', value: 'OLED' }],
      scores: [
        { key: 'imagem', score: 9 },
        { key: 'custo_beneficio', score: 8 },
      ],
      status: 'ficha',
    },
  })
}

export const ANALYSIS_DATA = {
  verdict: 'Uma TV OLED excelente para filmes e games, com contraste perfeito e preço competitivo no Brasil.',
  pros: [{ text: 'Contraste perfeito' }, { text: '144 Hz para games' }, { text: 'Bom processamento' }],
  cons: [{ text: 'Brilho limitado em sala clara' }, { text: 'Sem DTS' }],
  sources: [{ title: 'Ficha técnica oficial', url: 'https://www.lg.com/br' }],
  reviewedAt: '2026-10-03T12:00:00.000Z',
}

export async function createOffer(
  payload: Payload,
  tracker: Tracker,
  refs: {
    productId: number
    variantId: number
    storeId: number
    data?: Partial<{ status: 'active' | 'unavailable'; affiliateUrl: string; priceMin: number; priceMax: number }>
  },
) {
  return tracker.add(
    'offers',
    await payload.create({
      collection: 'offers',
      data: {
        product: refs.productId,
        variant: refs.variantId,
        store: refs.storeId,
        url: 'https://www.loja.com.br/produto',
        affiliateUrl: 'https://www.loja.com.br/produto?tag=decicompra-20',
        priceMin: 4300,
        priceMax: 4600,
        verifiedAt: new Date().toISOString(),
        status: 'active',
        ...refs.data,
      },
    }),
  )
}
