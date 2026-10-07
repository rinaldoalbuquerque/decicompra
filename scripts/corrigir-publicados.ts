import { getPayload } from 'payload'

import config from '../src/payload.config'

// Correções de 07/10/2026 em produtos e conteúdos já publicados, conferidas nos sites oficiais:
// Samsung Crystal UHD é o U8100F no Brasil; a Philips NA230 tem 13 funções prontas.
// Troca só os trechos exatos escritos no carregamento: fotos, status e edições do responsável ficam.
// Sem APLICAR=1, só mostra o que mudaria.
const APPLY = process.argv.includes('--aplicar') || process.env.APLICAR === '1'
const payload = await getPayload({ config })

type Pair = [string, string]

// Troca trechos dentro de qualquer valor (texto, listas, texto rico), sem mexer no resto
function replaceIn<T>(value: T, pairs: Pair[]): { value: T; changed: boolean } {
  const before = JSON.stringify(value ?? null)
  let after = before
  for (const [from, to] of pairs) after = after.split(JSON.stringify(from).slice(1, -1)).join(JSON.stringify(to).slice(1, -1))
  return { value: JSON.parse(after) as T, changed: after !== before }
}

async function patch(collection: 'products' | 'contents', slug: string, fields: string[], pairs: Pair[], extra?: (doc: Record<string, unknown>) => Record<string, unknown>) {
  const { docs } = await payload.find({ collection, where: { slug: { equals: slug } }, limit: 1, depth: 0 })
  const doc = docs[0] as unknown as Record<string, unknown> | undefined
  if (!doc) return console.log(`- ${collection}:${slug} não encontrado (já corrigido?)`)
  const data: Record<string, unknown> = {}
  for (const field of fields) {
    const { value, changed } = replaceIn(doc[field], pairs)
    if (changed) data[field] = value
  }
  Object.assign(data, extra?.(doc) ?? {})
  if (Object.keys(data).length === 0) return console.log(`= ${collection}:${slug} sem trechos a corrigir`)
  console.log(`${APPLY ? '✓' : '~'} ${collection}:${slug} → ${Object.keys(data).join(', ')}`)
  if (APPLY) await payload.update({ collection, id: doc.id as number, data, context: { skipPublicationCheck: true } })
}

const PRODUCT_TEXT = ['name', 'verdict', 'pros', 'cons', 'recommendedFor', 'avoidIf', 'fullReview', 'faq', 'scores']

// 1) Philips Série 2000 XL (NA230): 13 funções prontas
await patch(
  'products',
  'philips-walita-serie-2000-xl-na230',
  PRODUCT_TEXT,
  [
    ['Painel touch com 8 funções prontas', 'Painel touch com 13 funções prontas'],
    ['Painel digital com 8 funções prontas', 'Painel digital com 13 funções prontas'],
    ['O painel touch tem 8 funções pré-definidas', 'O painel touch tem 13 funções pré-definidas'],
    ['Menos funções e acabamento mais simples que a Série 3000', 'Acabamento mais simples e menos capacidade que a Série 3000'],
    ['mais capacidade (7,2 L), mais funções (12) e potência maior', 'mais capacidade (7,2 L) e potência maior'],
  ],
  (doc) => {
    const specs = (doc.specs as { key: string; value?: string | null }[] | undefined) ?? []
    const row = specs.find((item) => item.key === 'funcoes_predefinidas')
    return row?.value === '8' ? { specs: specs.map((item) => (item === row ? { ...item, value: '13' } : item)) } : {}
  },
)
await patch(
  'contents',
  'mondial-grand-family-afn-50-bi-vs-philips-walita-serie-2000-xl-na230',
  ['body', 'summary'],
  [['A Philips tem painel touch com 8 funções prontas', 'A Philips tem painel touch com 13 funções prontas']],
)

// 2) Samsung Crystal UHD: no Brasil é o U8100F (códigos UN55U8100FGXZD e UN65U8100FGXZD)
const BR_SOURCE = {
  title: 'Samsung Brasil: Smart TV 55" Crystal UHD 4K U8100F (ficha oficial)',
  url: 'https://www.samsung.com/br/tvs/uhd-4k-tv/u8000f-55-inch-crystal-uhd-4k-smart-tv-un55u8100fgxzd/',
}
const OLD_SAMSUNG = 'samsung-crystal-uhd-u8000f'
const { docs: samsung } = await payload.find({ collection: 'products', where: { slug: { equals: OLD_SAMSUNG } }, limit: 1, depth: 0 })
if (samsung[0]) {
  const { docs: variants } = await payload.find({ collection: 'variants', where: { product: { equals: samsung[0].id } }, depth: 0, limit: 10 })
  for (const variant of variants) {
    const codes: Record<string, string> = { UN55U8000F: 'UN55U8100FGXZD', UN65U8000F: 'UN65U8100FGXZD' }
    const data: Record<string, unknown> = {}
    if (variant.modelCode && codes[variant.modelCode]) data.modelCode = codes[variant.modelCode]
    // O consumo de 120 W era do modelo americano
    const specs = variant.specs ?? []
    if (specs.some((row) => row.key === 'consumo' && row.value === '120')) {
      data.specs = specs.map((row) => (row.key === 'consumo' && row.value === '120' ? { ...row, value: null } : row))
    }
    if (Object.keys(data).length === 0) continue
    console.log(`${APPLY ? '✓' : '~'} variante ${variant.label} → ${Object.keys(data).join(', ')}`)
    if (APPLY) await payload.update({ collection: 'variants', id: variant.id, data })
  }
}
await patch('products', OLD_SAMSUNG, PRODUCT_TEXT, [['U8000F', 'U8100F']], (doc) => {
  const sources = (doc.sources as { title: string; url: string }[] | undefined) ?? []
  const foreign = (url: string) => url.includes('africa_pt') || url.includes('microcenter.com')
  return sources.some((source) => foreign(source.url))
    ? { sources: [BR_SOURCE, ...sources.filter((source) => !foreign(source.url)).map(({ title, url }) => ({ title, url }))] }
    : {}
})
await patch('contents', 'melhores-smart-tvs', ['summary', 'metaDescription', 'body', 'picks', 'title'], [['U8000F', 'U8100F']])
// Por último, o endereço (o redirecionamento do antigo é criado automaticamente)
if (samsung[0]) {
  console.log(`${APPLY ? '✓' : '~'} products:${OLD_SAMSUNG} → slug samsung-crystal-uhd-u8100f`)
  if (APPLY) await payload.update({ collection: 'products', id: samsung[0].id, data: { slug: 'samsung-crystal-uhd-u8100f' }, context: { skipPublicationCheck: true } })
}

console.log(APPLY ? '\nCorreções aplicadas.' : '\nSimulação: nada foi gravado. Rode com APLICAR=1 para gravar.')
process.exit(0)
