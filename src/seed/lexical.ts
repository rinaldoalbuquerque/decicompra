// Monta documentos Lexical simples (dados de demonstração e testes)
const base = { format: '', indent: 0, version: 1, direction: null }

const text = (value: string) => ({ type: 'text', text: value, format: 0, style: '', mode: 'normal', detail: 0, version: 1 })

export const paragraph = (value: string) => ({ ...base, type: 'paragraph', textFormat: 0, textStyle: '', children: [text(value)] })

export const heading = (tag: 'h2' | 'h3', value: string) => ({ ...base, type: 'heading', tag, children: [text(value)] })

let counter = 0
export const block = (fields: Record<string, unknown>) => ({
  type: 'block',
  format: '',
  version: 2,
  fields: { id: `blk${Date.now().toString(36)}${(counter++).toString(36)}`, blockName: '', ...fields },
})

export const lexicalDoc = (children: unknown[]) => ({ root: { ...base, type: 'root', children } })
