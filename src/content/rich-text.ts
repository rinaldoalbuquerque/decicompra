import { slugify } from '../lib/slug'

export type HeadingEntry = { id: string; text: string; level: 2 | 3 }

type LexicalNode = { type?: string; tag?: string; text?: string; children?: LexicalNode[] }

// Ids das seções fixas das páginas e do layout: um título do texto com o mesmo nome ganha sufixo
// (ao criar uma seção com id novo numa página, inclua-o aqui)
export const RESERVED_IDS = [
  'conteudo',
  'onde-comprar',
  'onde-comprar-titulo',
  'fontes-titulo',
  'notas',
  'especificacoes',
  'analise',
  'alternativas',
  'faq',
  'escolha',
  'criterios',
  'so-diferencas',
  'conclusao',
  'lojas',
  'relacionados',
  'comparacao',
  'escolhas',
  'tambem-consideramos',
  'como-escolher',
  'como-escolhemos',
]

export function headingId(text: string): string {
  return slugify(text) || 'secao'
}

export function nodeText(node: LexicalNode): string {
  if (typeof node.text === 'string') return node.text
  return (node.children ?? []).map(nodeText).join('')
}

// Índice da página: títulos h2/h3 na ordem, com ids únicos (os mesmos usados ao renderizar)
export function extractHeadings(doc: unknown): HeadingEntry[] {
  const root = (doc as { root?: LexicalNode } | null)?.root
  if (!root) return []
  // Section gera também o id do título ({id}-titulo)
  const used = new Map<string, number>(RESERVED_IDS.flatMap((id) => [[id, 1] as const, [`${id}-titulo`, 1] as const]))
  const entries: HeadingEntry[] = []
  for (const node of root.children ?? []) {
    if (node.type !== 'heading' || (node.tag !== 'h2' && node.tag !== 'h3')) continue
    const text = nodeText(node).trim()
    if (!text) continue
    const base = headingId(text)
    const count = (used.get(base) ?? 0) + 1
    used.set(base, count)
    entries.push({ id: count === 1 ? base : `${base}-${count}`, text, level: node.tag === 'h2' ? 2 : 3 })
  }
  return entries
}
