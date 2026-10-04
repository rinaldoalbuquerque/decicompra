import { RichText, type JSXConvertersFunction } from '@payloadcms/richtext-lexical/react'

import type { SpecAttribute, SpecRow } from '@/catalog/spec-template'
import { specWinners } from '@/content/comparison'
import { extractHeadings, nodeText } from '@/content/rich-text'
import { toImageSet, type ProductSummary } from '@/content/view-models'
import { relId } from '@/lib/relations'

import { FaqList } from './FaqList'
import { ProductCard } from './ProductCard'
import { ProductImage } from './ProductImage'
import { StoreButtons } from './StoreButtons'

type SummaryWithProduct = ProductSummary & { product: { id: number; specs?: SpecRow[] | null }; specRows?: SpecRow[] }
type Fields = Record<string, unknown>
type BlockArgs = { node: { fields: Fields } }

const idOf = (value: unknown) => {
  const id = relId(value)
  return id === null ? null : Number(id)
}

function ComparisonTable({ ids, attributes, products, template }: { ids: number[]; attributes: string[]; products: Map<number, SummaryWithProduct>; template: SpecAttribute[] }) {
  const columns = ids.map((id) => products.get(id)).filter((item): item is SummaryWithProduct => Boolean(item))
  if (columns.length < 2) return null
  const rows = template.filter((attr) => attr.comparable !== false && (attributes.length === 0 || attributes.includes(attr.key)))
  const winners = new Map(
    specWinners(
      rows,
      columns.map((column) => ({ productId: column.id, rows: column.specRows ?? column.product.specs ?? [] })),
      [],
    ).map((winner) => [winner.key, winner.winnerIds]),
  )
  return (
    <div className="my-6 overflow-x-auto">
      <table className="w-full min-w-[480px] border-collapse text-sm">
        <thead>
          <tr className="bg-cinza-claro">
            <th scope="col" className="p-2 text-left">
              Especificação
            </th>
            {columns.map((column) => (
              <th key={column.id} scope="col" className="p-2 text-left">
                <a href={`/produtos/${column.slug}/`} className="hover:underline">
                  {column.name}
                </a>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((attr) => (
            <tr key={attr.key} className="border-t border-slate-200">
              <th scope="row" className="p-2 text-left font-medium">
                {attr.unit ? `${attr.label} (${attr.unit})` : attr.label}
              </th>
              {columns.map((column) => {
                const value = (column.specRows ?? column.product.specs ?? []).find((row) => row.key === attr.key)?.value ?? '—'
                const isWinner = winners.get(attr.key)?.includes(column.id) ?? false
                return (
                  <td key={column.id} data-winner={isWinner ? 'true' : undefined} className={`p-2 ${isWinner ? 'bg-green-50 font-semibold text-verde-texto' : ''}`}>
                    {value}
                    {isWinner ? <span className="sr-only"> (melhor)</span> : null}
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// Texto rico dos conteúdos e análises, com os blocos do DeciCompra (spec §4.9)
export function RichContent({
  data,
  products,
  template = [],
}: {
  data: unknown
  products: Map<number, SummaryWithProduct>
  template?: SpecAttribute[]
}) {
  if (!data || typeof data !== 'object' || !('root' in data)) return null
  const headings = extractHeadings(data)
  let headingIndex = 0

  const converters: JSXConvertersFunction = ({ defaultConverters }) => ({
    ...defaultConverters,
    heading: ({ node, nodesToJSX }) => {
      const children = nodesToJSX({ nodes: node.children })
      const tag = node.tag === 'h3' ? 'h3' : node.tag === 'h2' ? 'h2' : 'h4'
      const text = nodeText(node as never).trim()
      const entry = tag !== 'h4' && text ? headings[headingIndex++] : undefined
      const Tag = tag
      return (
        <Tag id={entry?.id} className={tag === 'h2' ? 'mt-10 scroll-mt-24 text-2xl font-bold' : 'mt-6 scroll-mt-24 text-xl font-bold'}>
          {children}
        </Tag>
      )
    },
    blocks: {
      productCard: ({ node }: BlockArgs) => {
        const summary = products.get(idOf((node.fields as Fields).product) ?? -1)
        return summary ? (
          <div className="my-6">
            <ProductCard summary={summary} />
          </div>
        ) : null
      },
      offerButton: ({ node }: BlockArgs) => {
        const fields = node.fields as Fields
        const summary = products.get(idOf(fields.product) ?? -1)
        if (!summary?.reference) return null
        const storeId = idOf(fields.store)
        const offers = summary.reference.offers.filter((offer) => storeId === null || offer.storeId === storeId)
        return (
          <div className="my-6 max-w-sm">
            <StoreButtons offers={offers} stale={summary.reference.stale} />
          </div>
        )
      },
      comparisonTable: ({ node }: BlockArgs) => {
        const fields = node.fields as Fields
        const ids = ((fields.products as unknown[]) ?? []).map(idOf).filter((id): id is number => id !== null)
        return <ComparisonTable ids={ids} attributes={(fields.attributes as string[] | undefined) ?? []} products={products} template={template} />
      },
      sideBySide: ({ node }: BlockArgs) => {
        const fields = node.fields as Record<string, string>
        return (
          <div className="my-6 grid gap-4 sm:grid-cols-2">
            {[
              [fields.leftTitle, fields.leftText],
              [fields.rightTitle, fields.rightText],
            ].map(([title, text]) => (
              <div key={title} className="rounded-xl border border-slate-200 bg-cinza-claro p-4">
                <h3 className="mb-2 font-bold">{title}</h3>
                <p>{text}</p>
              </div>
            ))}
          </div>
        )
      },
      tip: ({ node }: BlockArgs) => {
        const fields = node.fields as Record<string, string>
        const warning = fields.kind === 'aviso'
        return (
          <aside className={`my-6 rounded-lg border-l-4 p-4 ${warning ? 'border-negativo bg-red-50' : 'border-verde-texto bg-green-50'}`}>
            <p className="mb-1 text-sm font-bold">{warning ? 'Atenção' : 'Dica'}</p>
            <p>{fields.text}</p>
          </aside>
        )
      },
      faq: ({ node }: BlockArgs) => {
        const items = ((node.fields as Fields).items as { question: string; answer: string }[] | undefined) ?? []
        return (
          <div className="my-6">
            <FaqList items={items} />
          </div>
        )
      },
      contentImage: ({ node }: BlockArgs) => {
        const fields = node.fields as Fields
        const image = toImageSet(fields.image)
        if (!image) return null
        return (
          <figure className="my-6">
            <ProductImage image={image} sizes="(min-width: 1024px) 760px, 100vw" />
            {fields.caption ? <figcaption className="mt-2 text-sm text-texto-suave">{String(fields.caption)}</figcaption> : null}
          </figure>
        )
      },
      simpleTable: ({ node }: BlockArgs) => {
        const fields = node.fields as Fields
        const header = (fields.header as string[] | undefined) ?? []
        const rows = ((fields.rows as { cells?: string[] }[] | undefined) ?? []).map((row) => row.cells ?? [])
        return (
          <div className="my-6 overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              {header.length > 0 ? (
                <thead>
                  <tr className="bg-cinza-claro">
                    {header.map((cell) => (
                      <th key={cell} scope="col" className="p-2 text-left">
                        {cell}
                      </th>
                    ))}
                  </tr>
                </thead>
              ) : null}
              <tbody>
                {rows.map((cells, index) => (
                  <tr key={index} className="border-t border-slate-200">
                    {cells.map((cell, cellIndex) => (
                      <td key={cellIndex} className="p-2">
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      },
    },
  })

  return <RichText data={data as never} converters={converters} className="rich-content max-w-none space-y-4 leading-relaxed" />
}
