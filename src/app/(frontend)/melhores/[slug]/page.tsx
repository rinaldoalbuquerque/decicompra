import type { Metadata } from 'next'
import Link from 'next/link'

import type { Criterion } from '@/catalog/score'
import type { SpecAttribute } from '@/catalog/spec-template'
import { AdSlot } from '@/components/site/AdSlot'
import { PAGE_CONTAINER, PageHeader, ProsCons, Section, SourcesList } from '@/components/site/blocks'
import { PriceRange } from '@/components/site/PriceRange'
import { ProductImage } from '@/components/site/ProductImage'
import { RelatedContents } from '@/components/site/RelatedContents'
import { RichContent } from '@/components/site/RichContent'
import { ScoreBadge } from '@/components/site/ScoreBadge'
import { StoreButtons } from '@/components/site/StoreButtons'
import { categoryPath, contentPath, productPath } from '@/content/paths'
import { extractProductIds } from '@/content/rules'
import { listYear, pickVariant } from '@/content/view-models'
import { getPublicContent } from '@/lib/data/contents'
import { getProductSummaries, type SummaryEntry } from '@/lib/data/products'
import { getAdsEnabled } from '@/lib/data/settings'
import { relId } from '@/lib/relations'
import type { Category } from '@/payload-types'
import { notFoundOrRedirect } from '@/lib/data/redirects'

export const revalidate = 3600
export const dynamicParams = true

export async function generateStaticParams() {
  return []
}

type Params = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params
  const content = await getPublicContent('melhores', slug)
  if (!content) return {}
  return { title: content.seo?.metaTitle || content.title, description: content.seo?.metaDescription || content.summary || undefined }
}

export default async function BestPage({ params }: Params) {
  const { slug } = await params
  const content = await getPublicContent('melhores', slug)
  if (!content) return notFoundOrRedirect(contentPath('melhores', slug))

  const [summaries, adsEnabled] = await Promise.all([
    getProductSummaries(
      extractProductIds({ body: content.body, picks: content.picks, alsoConsidered: content.alsoConsidered }),
    ),
    getAdsEnabled(),
  ])
  const picks = [...(content.picks ?? [])]
    .sort((a, b) => (a.position ?? 99) - (b.position ?? 99))
    .map((pick) => ({ pick, summary: summaries.get(Number(relId(pick.product))) }))
    .filter((item): item is { pick: typeof item.pick; summary: SummaryEntry } => Boolean(item.summary))
    // Preço e botões da variante escolhida na escolha (ou da de referência)
    .map((item) => ({ ...item, variant: pickVariant(item.summary, relId(item.pick.variant) === null ? null : Number(relId(item.pick.variant))) }))
  const hasOffers = picks.some(({ variant }) => (variant?.offers.length ?? 0) > 0)
  const considered = (content.alsoConsidered ?? [])
    .map((item) => ({ item, summary: summaries.get(Number(relId(item.product))) }))
    .filter((entry): entry is { item: typeof entry.item; summary: SummaryEntry } => Boolean(entry.summary))

  const subcategory = typeof content.primarySubcategory === 'object' ? (content.primarySubcategory as Category) : null
  const category = subcategory && typeof subcategory.parent === 'object' ? (subcategory.parent as Category) : null
  const template = (subcategory?.specTemplate ?? []) as unknown as SpecAttribute[]
  const criteria = (subcategory?.criteria ?? []) as unknown as Criterion[]
  const highlight = template.filter((attr) => attr.highlight).slice(0, 3)
  const year = listYear(content)
  const analyzed = content.modelsAnalyzed ? `${content.modelsAnalyzed} modelos analisados · ` : ''

  return (
    <div className={PAGE_CONTAINER}>
      <div className="mx-auto max-w-[960px]">
        <PageHeader
          breadcrumbs={[
            { label: 'Início', href: '/' },
            ...(category?.slug ? [{ label: category.name, href: categoryPath(category.slug) }] : []),
            ...(subcategory?.slug ? [{ label: subcategory.name, href: categoryPath(subcategory.slug, category?.slug) }] : []),
            { label: 'Melhores', href: '/melhores/' },
          ]}
          title={content.title.includes(String(year)) ? content.title : `${content.title} (${year})`}
          reviewedAt={content.reviewedAt}
          authorName={typeof content.author === 'object' ? content.author?.name : null}
          withAffiliateNotice={hasOffers}
        >
          <p className="text-sm text-texto-suave">
            {analyzed}
            {picks.length} selecionados ·{' '}
            <Link href="/como-avaliamos/" className="underline">
              Como avaliamos
            </Link>
          </p>
        </PageHeader>

        {content.summary ? <p className="mt-4 text-lg">{content.summary}</p> : null}

        {picks.length > 0 ? (
          <>
            <section aria-label="Nossas escolhas em resumo" className="mt-6 rounded-xl border-2 border-azul-eletrico bg-cinza-claro p-5">
              <h2 className="mb-4 text-xl font-bold">Nossas escolhas em resumo</h2>
              <ul className="divide-y divide-slate-300">
                {picks.map(({ pick, summary, variant }) => (
                  <li key={pick.id ?? summary.id} className="grid items-center gap-3 py-3 sm:grid-cols-[180px_80px_1fr_auto]">
                    <span className="w-fit rounded-full bg-verde-texto px-3 py-1 text-xs font-bold text-branco">{pick.profileLabel}</span>
                    <ProductImage image={summary.image} sizes="80px" className="max-w-[80px]" />
                    <div>
                      <Link href={productPath(summary.slug)} className="font-bold hover:underline">
                        {summary.name}
                      </Link>{' '}
                      <ScoreBadge score={summary.finalScore} />
                      {variant ? <PriceRange variant={variant} /> : null}
                    </div>
                    {variant ? <StoreButtons offers={variant.offers.slice(0, 1)} stale={variant.stale} compact /> : null}
                  </li>
                ))}
              </ul>
            </section>

            <Section id="comparacao" title="Comparação rápida">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-sm">
                  <thead>
                    <tr className="bg-cinza-claro">
                      <th scope="col" className="p-2 text-left">
                        Modelo
                      </th>
                      <th scope="col" className="p-2 text-left">
                        Nota
                      </th>
                      {highlight.map((attr) => (
                        <th key={attr.key} scope="col" className="p-2 text-left">
                          {attr.unit ? `${attr.label} (${attr.unit})` : attr.label}
                        </th>
                      ))}
                      <th scope="col" className="p-2 text-left">
                        Faixa de preço
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {picks.map(({ summary, variant }) => (
                      <tr key={summary.id} className="border-t border-slate-200">
                        <th scope="row" className="p-2 text-left font-medium">
                          {summary.name}
                        </th>
                        <td className="p-2">{summary.scoreText ?? '—'}</td>
                        {highlight.map((attr) => (
                          <td key={attr.key} className="p-2">
                            {summary.specRows.find((row) => row.key === attr.key)?.value ?? '—'}
                          </td>
                        ))}
                        <td className="p-2">{variant?.stale ? 'Ver na loja' : (variant?.valuesText ?? '—')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Section>
          </>
        ) : null}

        <AdSlot placement="content" enabled={adsEnabled} />

        <Section id="escolhas" title="Cada escolha em detalhe">
          <ol className="space-y-6">
            {picks.map(({ pick, summary, variant }, index) => (
              <li key={pick.id ?? summary.id} className="grid gap-4 rounded-xl border border-slate-200 p-5 sm:grid-cols-[48px_160px_1fr]">
                <span className="font-display text-3xl font-extrabold text-azul-eletrico">{index + 1}</span>
                <ProductImage image={summary.image} sizes="160px" className="max-w-[200px]" />
                <div className="space-y-2">
                  <h3 className="text-xl font-bold">
                    {summary.name}: {pick.profileLabel.toLowerCase()}
                  </h3>
                  <ScoreBadge score={summary.finalScore} showBand />
                  {pick.why ? (
                    <p>
                      <strong>Por que escolhemos:</strong> {pick.why}
                    </p>
                  ) : null}
                  <ProsCons pros={(summary.product.pros ?? []).map((item) => item.text)} cons={(summary.product.cons ?? []).map((item) => item.text)} />
                  {summary.product.recommendedFor ? (
                    <p className="text-sm">
                      <strong>Indicado para:</strong> {summary.product.recommendedFor}
                    </p>
                  ) : null}
                  <p className="text-sm">
                    <Link href={productPath(summary.slug)} className="font-semibold text-azul-eletrico hover:underline">
                      Ver a análise completa →
                    </Link>
                  </p>
                  {variant ? (
                    <>
                      <PriceRange variant={variant} />
                      <StoreButtons offers={variant.offers} stale={variant.stale} compact />
                    </>
                  ) : null}
                </div>
              </li>
            ))}
          </ol>
        </Section>

        {considered.length > 0 ? (
          <Section id="tambem-consideramos" title="Também consideramos">
            <ul className="space-y-2">
              {considered.map(({ item, summary }) => (
                <li key={item.id ?? summary.id}>
                  <Link href={productPath(summary.slug)} className="font-semibold hover:underline">
                    {summary.name}
                  </Link>
                  {item.reason ? <span className="text-texto-suave"> — {item.reason}</span> : null}
                </li>
              ))}
            </ul>
          </Section>
        ) : null}

        {content.body ? (
          // O corpo ("Como escolher") traz os próprios títulos
          <div id="como-escolher" className="mt-10">
            <RichContent data={content.body} products={summaries} template={template} />
          </div>
        ) : null}

        {criteria.length > 0 ? (
          <Section id="como-escolhemos" title="Como escolhemos estes produtos">
            <p className="mb-3">Cada modelo recebe uma nota de 0 a 10 por critério; a Nota DeciCompra é a média ponderada pelos pesos abaixo.</p>
            <ul className="grid gap-2 sm:grid-cols-2">
              {criteria.map((criterion) => (
                <li key={criterion.key} className="rounded-lg bg-cinza-claro px-3 py-2">
                  {criterion.name} — {criterion.weight}%
                </li>
              ))}
            </ul>
            <p className="mt-3 text-sm">
              Detalhes em{' '}
              <Link href="/como-avaliamos/" className="underline">
                Como avaliamos os produtos
              </Link>
              .
            </p>
          </Section>
        ) : null}

        <SourcesList sources={(content.sources ?? []).map((item) => ({ title: item.title, url: item.url }))} />

        <RelatedContents content={content} />
      </div>
    </div>
  )
}
