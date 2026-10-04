import { relId } from '../lib/relations'
import type { ContentType } from './paths'

export type ContentStatus = 'rascunho' | 'em_revisao' | 'publicado' | 'agendado'

export const PUBLIC_STATUSES: ContentStatus[] = ['publicado', 'agendado']

type WithProduct = { product?: unknown }

export type ExtractInput = {
  body?: unknown
  picks?: WithProduct[] | null
  alsoConsidered?: WithProduct[] | null
  comparedProducts?: unknown[] | null
  badges?: WithProduct[] | null
  chooseIf?: WithProduct[] | null
  specOverrides?: { winner?: unknown }[] | null
}

function collectFromRichText(node: unknown, ids: Set<number>): void {
  if (Array.isArray(node)) {
    for (const item of node) collectFromRichText(item, ids)
    return
  }
  if (!node || typeof node !== 'object') return
  const record = node as Record<string, unknown>
  if (record.type === 'block' && record.fields && typeof record.fields === 'object') {
    const fields = record.fields as { product?: unknown; products?: unknown }
    add(ids, fields.product)
    if (Array.isArray(fields.products)) for (const product of fields.products) add(ids, product)
  }
  for (const value of Object.values(record)) if (value && typeof value === 'object') collectFromRichText(value, ids)
}

function add(ids: Set<number>, value: unknown): void {
  const id = relId(value)
  if (id !== null && Number.isFinite(Number(id))) ids.add(Number(id))
}

// Produtos citados por um conteúdo, nos blocos do texto e nos campos de cada tipo (spec §5.6)
export function extractProductIds(input: ExtractInput): number[] {
  const ids = new Set<number>()
  collectFromRichText(input.body, ids)
  for (const list of [input.picks, input.alsoConsidered, input.badges, input.chooseIf]) {
    for (const item of list ?? []) add(ids, item.product)
  }
  for (const product of input.comparedProducts ?? []) add(ids, product)
  for (const override of input.specOverrides ?? []) add(ids, override.winner)
  return [...ids].sort((a, b) => a - b)
}

export function effectiveMetaDescription(meta?: string | null, summary?: string | null): string {
  return meta?.trim() || summary?.trim() || ''
}

export type ContentPublicationInput = {
  type: ContentType
  status: ContentStatus
  summary?: string | null
  metaDescription?: string | null
  sourcesCount: number
  reviewedAt?: string | null
  picksCount: number
  comparedCount: number
}

// O que falta para publicar ou agendar um conteúdo (spec §5.7)
export function checkContentPublication(input: ContentPublicationInput): string[] {
  if (!PUBLIC_STATUSES.includes(input.status)) return []
  const errors: string[] = []
  if (!input.summary?.trim()) errors.push('Escreva o resumo rápido.')
  const meta = effectiveMetaDescription(input.metaDescription, input.summary)
  if (meta.length < 70 || meta.length > 160) {
    errors.push('A meta descrição (ou o resumo, se ela estiver vazia) precisa ter de 70 a 160 caracteres.')
  }
  if (input.sourcesCount < 1) errors.push('Cite pelo menos 1 fonte.')
  if (!input.reviewedAt) errors.push('Informe a data de revisão.')
  if (input.type === 'melhores' && (input.picksCount < 3 || input.picksCount > 10)) {
    errors.push('Uma lista de Melhores precisa de 3 a 10 escolhas.')
  }
  if (input.type === 'comparativo' && (input.comparedCount < 2 || input.comparedCount > 3)) {
    errors.push('Um comparativo precisa de 2 ou 3 produtos.')
  }
  return errors
}

export function isPubliclyVisible(status: ContentStatus, publishAt: string | Date | null | undefined, now: Date): boolean {
  if (!PUBLIC_STATUSES.includes(status) || !publishAt) return false
  return new Date(publishAt).getTime() <= now.getTime()
}
