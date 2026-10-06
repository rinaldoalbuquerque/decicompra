import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound, permanentRedirect } from 'next/navigation'

import type { Criterion } from '@/catalog/score'
import type { SpecAttribute } from '@/catalog/spec-template'
import { AdSlot } from '@/components/site/AdSlot'
import { PAGE_CONTAINER, PageHeader, Section, SourcesList } from '@/components/site/blocks'
import { PriceRange } from '@/components/site/PriceRange'
import { ProductImage } from '@/components/site/ProductImage'
import { RelatedContents } from '@/components/site/RelatedContents'
import { RichContent } from '@/components/site/RichContent'
import { ScoreBadge } from '@/components/site/ScoreBadge'
import { StoreButtons } from '@/components/site/StoreButtons'
import { canonicalComparisonSlug, criterionWinners, specWinners } from '@/content/comparison'
import { categoryPath, contentPath, productPath } from '@/content/paths'
import { extractProductIds } from '@/content/rules'
import { formatScore } from '@/content/view-models'
import { getPublicContent } from '@/lib/data/contents'
import { getProductSummaries, type SummaryEntry } from '@/lib/data/products'
import { notFoundOrRedirect } from '@/lib/data/redirects'
import { getAdsEnabled } from '@/lib/data/settings'
import { relId } from '@/lib/relations'
import type { Category } from '@/payload-types'

export const revalidate = 3600
export const dynamicParams = true

export async function generateStaticParams() {
  return []
}

type Params = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params
  const content = await getPublicContent('comparativo', slug)
  if (!content) return {}
  return { title: content.seo?.metaTitle || content.title, description: content.seo?.metaDescription || content.summary || undefined }
}

export default async function ComparisonPage({ params }: Params) {
  const { slug } = await params
  const content = await getPublicContent('comparativo', slug)
  if (!content) {
    // Produtos em outra ordem → endereço canônico (spec §3.2)
    const canonical = canonicalComparisonSlug(slug)
    if (canonical !== slug && (await getPublicContent('comparativo', canonical))) permanentRedirect(contentPath('comparativo', canonical))
    return notFoundOrRedirect(contentPath('comparativo', slug))
  }

  const ids = (content.comparedProducts ?? []).map((item) => Number(relId(item))).filter(Number.isFinite)
  const [summaries, adsEnabled] = await Promise.all([
    getProductSummaries([...new Set([...ids, ...extractProductIds({ body: content.body })])]),
    getAdsEnabled(),
  ])
  const columns = ids.map((id) => summaries.get(id)).filter((item): item is SummaryEntry => Boolean(item))
  if (columns.length < 2) notFound()

  const subcategory = typeof content.primarySubcategory === 'object' ? (content.primarySubcategory as Category) : null
  const category = subcategory && typeof subcategory.parent === 'object' ? (subcategory.parent as Category) : null
  const template = (subcategory?.specTemplate ?? []) as unknown as SpecAttribute[]
  const criteria = (subcategory?.criteria ?? []) as unknown as Criterion[]

  const badgeOf = (id: number) => (content.badges ?? []).find((badge) => Number(relId(badge.product)) === id)?.label
  const chooseOf = (id: number) => (content.chooseIf ?? []).filter((item) => Number(relId(item.product)) === id)
  const byCriterion = criterionWinners(
    columns.map((column) => ({ id: column.id, scores: column.product.scores ?? [] })),
    criteria,
  )
  const tally = new Map(columns.map((column) => [column.id, byCriterion.filter((row) => row.winnerIds.length === 1 && row.winnerIds[0] === column.id).length]))
  const comparable = template.filter((attr) => attr.comparable !== false)
  const bySpec = new Map(
    specWinners(
      comparable,
      columns.map((column) => ({ productId: column.id, rows: column.specRows })),
      (content.specOverrides ?? []).map((item) => ({ attributeKey: item.attributeKey, winner: Number(relId(item.winner)) || null, noWinner: item.noWinner })),
    ).map((row) => [row.key, row.winnerIds]),
  )
  const hasOffers = columns.some((column) => (column.reference?.offers.length ?? 0) > 0)
  const gridCols = columns.length === 3 ? 'sm:grid-cols-3' : 'sm:grid-cols-2'

  return (
    <div className={`${PAGE_CONTAINER} pb-24 lg:pb-8`}>
      <div className="mx-auto max-w-[960px]">
        <PageHeader
          breadcrumbs={[
            { label: 'Início', href: '/' },
            ...(category?.slug ? [{ label: category.name, href: categoryPath(category.slug) }] : []),
            ...(subcategory?.slug ? [{ label: subcategory.name, href: categoryPath(subcategory.slug, category?.slug) }] : []),
            { label: 'Comparativos', href: '/comparar/' },
          ]}
          title={content.title}
          reviewedAt={content.reviewedAt}
          authorName={typeof content.author === 'object' ? content.author?.name : null}
          withAffiliateNotice={hasOffers}
        />

        <section aria-label="Veredito rápido" className="mt-6 rounded-xl border-2 border-azul-eletrico bg-cinza-claro p-5">
          <div className={`grid gap-6 ${gridCols}`}>
            {columns.map((column) => (
              <div key={column.id} className="space-y-2 text-center">
                <ProductImage image={column.image} sizes="300px" className="mx-auto max-w-[260px]" />
                <h2 className="text-lg font-bold">
                  <Link href={productPath(column.slug)} className="hover:underline">
                    {column.name}
                  </Link>
                </h2>
                <div className="flex flex-wrap items-center justify-center gap-2">
                  <ScoreBadge score={column.finalScore} />
                  {badgeOf(column.id) ? <span className="rounded-full bg-verde-texto px-3 py-0.5 text-xs font-bold text-branco">{badgeOf(column.id)}</span> : null}
                </div>
                {column.reference ? (
                  <div className="space-y-2 text-left">
                    <PriceRange variant={column.reference} />
                    <StoreButtons offers={column.reference.offers} stale={column.reference.stale} compact />
                  </div>
                ) : null}
              </div>
            ))}
          </div>
          {content.summary ? (
            <p className="mt-5 border-t border-slate-300 pt-4">
              <strong>Resumo:</strong> {content.summary}
            </p>
          ) : null}
        </section>

        {(content.chooseIf ?? []).length > 0 ? (
          <Section id="escolha" title="Escolha qual se…">
            <div className={`grid gap-4 ${gridCols}`}>
              {columns.map((column) => (
                <div key={column.id} className="rounded-xl border border-slate-200 p-4">
                  <p className="mb-2 font-bold">{column.name}</p>
                  <ul className="list-disc space-y-1 pl-5">
                    {chooseOf(column.id).map((item) => (
                      <li key={item.id ?? item.text}>{item.text}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </Section>
        ) : null}

        {criteria.length > 0 ? (
          <Section id="criterios" title="Quem vence em cada critério">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="bg-cinza-claro">
                    <th scope="col" className="p-2 text-left">
                      Critério
                    </th>
                    {columns.map((column) => (
                      <th key={column.id} scope="col" className="p-2 text-left">
                        {column.name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {criteria.map((criterion) => {
                    const winners = byCriterion.find((row) => row.key === criterion.key)?.winnerIds ?? []
                    return (
                      <tr key={criterion.key} className="border-t border-slate-200">
                        <th scope="row" className="p-2 text-left font-medium">
                          {criterion.name}
                        </th>
                        {columns.map((column) => {
                          const score = (column.product.scores ?? []).find((row) => row.key === criterion.key)?.score
                          const wins = winners.includes(column.id)
                          return (
                            <td key={column.id} data-winner={wins ? 'true' : undefined} className={`p-2 ${wins ? 'bg-green-50 font-semibold text-verde-texto' : ''}`}>
                              {formatScore(score) ?? '—'}
                              {wins ? (winners.length > 1 ? ' (empate)' : ' ✔') : null}
                            </td>
                          )
                        })}
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
            <p className="mt-3 text-sm">
              <strong>Placar:</strong> {columns.map((column) => `${column.name} ${tally.get(column.id) ?? 0}`).join(' × ')}
            </p>
          </Section>
        ) : null}

        <AdSlot placement="content" enabled={adsEnabled} />

        {comparable.length > 0 ? (
          <Section id="especificacoes" title="Especificações lado a lado">
            <input id="so-diferencas" type="checkbox" className="peer mr-2 align-middle" />
            <label htmlFor="so-diferencas" className="text-sm">
              Mostrar só as diferenças
            </label>
            <div className="mt-3 overflow-x-auto peer-checked:[&_tr[data-equal=true]]:hidden">
              <table className="w-full border-collapse text-sm">
                <thead className="sticky top-0">
                  <tr className="bg-cinza-claro">
                    <th scope="col" className="p-2 text-left">
                      Especificação
                    </th>
                    {columns.map((column) => (
                      <th key={column.id} scope="col" className="p-2 text-left">
                        {column.name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {comparable.map((attr) => {
                    const values = columns.map((column) => column.specRows.find((row) => row.key === attr.key)?.value ?? '—')
                    const winners = bySpec.get(attr.key) ?? []
                    return (
                      <tr key={attr.key} data-equal={values.every((value) => value === values[0]) ? 'true' : undefined} className="border-t border-slate-200">
                        <th scope="row" className="p-2 text-left font-medium">
                          {attr.unit ? `${attr.label} (${attr.unit})` : attr.label}
                        </th>
                        {columns.map((column, index) => {
                          const wins = winners.includes(column.id)
                          return (
                            <td key={column.id} data-winner={wins ? 'true' : undefined} className={`p-2 ${wins ? 'bg-green-50 font-semibold text-verde-texto' : ''}`}>
                              {values[index]}
                              {wins ? <span className="sr-only"> (melhor)</span> : null}
                            </td>
                          )
                        })}
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </Section>
        ) : null}

        {content.body ? (
          <Section id="analise" title="Análise detalhada">
            <RichContent data={content.body} products={summaries} template={template} />
          </Section>
        ) : null}

        <Section id="conclusao" title="Conclusão">
          {content.conclusion ? <p className="mb-6 text-lg">{content.conclusion}</p> : null}
          <div id="lojas" className={`grid scroll-mt-24 gap-4 ${gridCols}`}>
            {columns.map((column) => (
              <div key={column.id} className="rounded-xl border border-slate-200 p-4">
                <p className="mb-2 font-bold">{column.name}</p>
                {column.reference ? (
                  <>
                    <PriceRange variant={column.reference} />
                    <div className="mt-2">
                      <StoreButtons offers={column.reference.offers} stale={column.reference.stale} />
                    </div>
                  </>
                ) : null}
              </div>
            ))}
          </div>
        </Section>

        <SourcesList sources={(content.sources ?? []).map((item) => ({ title: item.title, url: item.url }))} />

        <RelatedContents content={content} />
      </div>

      {hasOffers ? (
        <div className="superficie-escura fixed inset-x-0 bottom-0 z-30 flex justify-around gap-2 bg-azul-profundo px-4 py-3 text-sm text-branco lg:hidden">
          {columns.map((column) => (
            <a key={column.id} href="#lojas" className="rounded-lg bg-azul-eletrico px-3 py-2 font-semibold">
              {column.name} · lojas
            </a>
          ))}
        </div>
      ) : null}
    </div>
  )
}
