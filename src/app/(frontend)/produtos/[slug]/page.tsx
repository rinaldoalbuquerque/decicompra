import type { Metadata } from 'next'
import Link from 'next/link'

import type { SpecAttribute, SpecRow } from '@/catalog/spec-template'
import { AdSlot } from '@/components/site/AdSlot'
import { PAGE_CONTAINER, PageHeader, ProsCons, QuickSummary, Section, SourcesList } from '@/components/site/blocks'
import { DecisionBox } from '@/components/site/DecisionBox'
import { FaqList } from '@/components/site/FaqList'
import { MobileDecisionBar } from '@/components/site/MobileDecisionBar'
import { ProductCard } from '@/components/site/ProductCard'
import { ProductImage } from '@/components/site/ProductImage'
import { RichContent } from '@/components/site/RichContent'
import { ScoreBadge } from '@/components/site/ScoreBadge'
import { categoryPath, contentPath, productPath } from '@/content/paths'
import { extractProductIds } from '@/content/rules'
import { formatScore } from '@/content/view-models'
import { getRelatedForProduct } from '@/lib/data/contents'
import { getProductSummaries, getPublicProduct, getSimilarProducts } from '@/lib/data/products'
import { getAdsEnabled } from '@/lib/data/settings'
import { notFoundOrRedirect } from '@/lib/data/redirects'
import { pageMetadata } from '@/lib/metadata'
import { JsonLd } from '@/components/site/JsonLd'
import { productReviewLd } from '@/content/structured-data'
import { siteUrl } from '@/lib/site-url'

export const revalidate = 3600
export const dynamicParams = true

export async function generateStaticParams() {
  return []
}

type Params = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params
  const page = await getPublicProduct(slug)
  if (!page) return {}
  const { product } = page
  return pageMetadata({
    path: productPath(product.slug ?? slug),
    title: product.seo?.metaTitle || (product.status === 'analise' ? `${product.name}: análise` : product.name),
    description: product.seo?.metaDescription || product.verdict || `Ficha técnica, especificações e onde comprar ${product.name}.`,
    // Ficha (sem análise) fica fora do Google (spec §5.5)
    noindex: product.status === 'ficha',
    type: product.status === 'analise' ? 'article' : 'website',
  })
}

function groupSpecs(template: SpecAttribute[], rows: SpecRow[]) {
  const groups = new Map<string, { label: string; value: string }[]>()
  for (const attr of template.filter((item) => !item.perVariant)) {
    const value = rows.find((row) => row.key === attr.key)?.value
    if (!value) continue
    const group = attr.group || 'Geral'
    groups.set(group, [...(groups.get(group) ?? []), { label: attr.unit ? `${attr.label} (${attr.unit})` : attr.label, value }])
  }
  return [...groups.entries()]
}

export default async function ProductPage({ params }: Params) {
  const { slug } = await params
  const page = await getPublicProduct(slug)
  if (!page) return notFoundOrRedirect(productPath(slug))
  const { product, summary, variants, subcategory, category, template, criteria } = page

  const [related, similar, adsEnabled, reviewProducts] = await Promise.all([
    getRelatedForProduct(product.id),
    subcategory ? getSimilarProducts(subcategory.id, product.id, product.finalScore ?? null) : Promise.resolve([]),
    getAdsEnabled(),
    getProductSummaries(extractProductIds({ body: product.fullReview })),
  ])

  const isReview = product.status === 'analise'
  const reference = variants.find((variant) => variant.isReference) ?? variants[0] ?? null
  const hasOffers = variants.some((variant) => variant.offers.length > 0)
  const perVariantAttrs = template.filter((attr) => attr.perVariant)
  const specGroups = groupSpecs(template, (product.specs ?? []) as SpecRow[])
  const toc = [
    criteria.length > 0 ? { id: 'notas', label: 'Notas por critério' } : null,
    { id: 'especificacoes', label: 'Especificações' },
    product.fullReview ? { id: 'analise', label: 'Análise completa' } : null,
    related.length + similar.length > 0 ? { id: 'alternativas', label: 'Alternativas e comparativos' } : null,
    (product.faq ?? []).length > 0 ? { id: 'faq', label: 'Perguntas frequentes' } : null,
  ].filter((item): item is { id: string; label: string } => Boolean(item))

  return (
    <div className={`${PAGE_CONTAINER} pb-24 lg:pb-8`}>
      {product.status === 'analise' && product.finalScore != null ? (
        <JsonLd
          data={productReviewLd({
            name: product.name,
            url: productPath(summary.slug),
            image: summary.image?.src,
            brand: summary.brandName,
            score: product.finalScore,
            verdict: product.verdict,
            reviewedAt: product.reviewedAt,
            siteUrl: siteUrl(),
          })}
        />
      ) : null}
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="min-w-0">
          <PageHeader
            breadcrumbs={[
              { label: 'Início', href: '/' },
              ...(category?.slug ? [{ label: category.name, href: categoryPath(category.slug) }] : []),
              ...(subcategory?.slug ? [{ label: subcategory.name, href: categoryPath(subcategory.slug, category?.slug) }] : []),
              { label: product.name },
            ]}
            title={isReview ? `${product.name}: análise` : product.name}
            reviewedAt={product.reviewedAt}
            withAffiliateNotice={hasOffers}
          />

          <div className="mt-6">
            <QuickSummary>
              <div className="grid gap-5 md:grid-cols-[220px_1fr]">
                <ProductImage image={summary.image} priority sizes="220px" />
                <div className="space-y-3">
                  <ScoreBadge score={product.finalScore} showBand size="lg" />
                  {product.verdict ? (
                    <p className="text-lg">
                      <strong>Em uma frase:</strong> {product.verdict}
                    </p>
                  ) : null}
                  <ProsCons pros={(product.pros ?? []).map((item) => item.text)} cons={(product.cons ?? []).map((item) => item.text)} />
                  {product.recommendedFor || product.avoidIf ? (
                    <dl className="grid gap-2 text-sm sm:grid-cols-2">
                      {product.recommendedFor ? (
                        <div>
                          <dt className="font-bold">Indicado para</dt>
                          <dd>{product.recommendedFor}</dd>
                        </div>
                      ) : null}
                      {product.avoidIf ? (
                        <div>
                          <dt className="font-bold">Evite se</dt>
                          <dd>{product.avoidIf}</dd>
                        </div>
                      ) : null}
                    </dl>
                  ) : null}
                </div>
              </div>
            </QuickSummary>
          </div>

          {toc.length > 1 ? (
            <nav aria-label="Nesta página" className="mt-6 text-sm">
              <ul className="flex flex-wrap gap-x-4 gap-y-1 text-azul-eletrico">
                {toc.map((item) => (
                  <li key={item.id}>
                    <a href={`#${item.id}`} className="hover:underline">
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          ) : null}

          {criteria.length > 0 ? (
            <Section id="notas" title="Notas por critério">
              <ul className="divide-y divide-slate-200 rounded-xl border border-slate-200">
                {criteria.map((criterion) => {
                  const row = (product.scores ?? []).find((item) => item.key === criterion.key)
                  return (
                    <li key={criterion.key} className="grid gap-1 p-4 sm:grid-cols-[1fr_auto]">
                      <div>
                        <p className="font-semibold">
                          {criterion.name} <span className="text-sm font-normal text-texto-suave">(peso {criterion.weight}%)</span>
                        </p>
                        {row?.justification ? <p className="text-sm text-texto-suave">{row.justification}</p> : null}
                      </div>
                      <p className="font-display text-xl font-extrabold text-azul-profundo">{formatScore(row?.score) ?? '—'}</p>
                    </li>
                  )
                })}
              </ul>
              <p className="mt-2 text-sm text-texto-suave">
                Como calculamos: <Link href="/como-avaliamos/" className="underline">Como avaliamos os produtos</Link>
              </p>
            </Section>
          ) : null}

          <AdSlot placement="content" enabled={adsEnabled} />

          <Section id="especificacoes" title="Especificações">
            {specGroups.length === 0 && perVariantAttrs.length === 0 ? <p className="text-texto-suave">Especificações em breve.</p> : null}
            {specGroups.map(([group, items]) => (
              <div key={group} className="mb-6">
                <h3 className="mb-2 font-bold">{group}</h3>
                <dl className="divide-y divide-slate-200 rounded-xl border border-slate-200">
                  {items.map((item) => (
                    <div key={item.label} className="grid grid-cols-2 gap-4 p-3 text-sm">
                      <dt className="text-texto-suave">{item.label}</dt>
                      <dd className="font-medium">{item.value}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            ))}
            {perVariantAttrs.length > 0 && variants.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-sm">
                  <caption className="mb-2 text-left font-bold">Por variante</caption>
                  <thead>
                    <tr className="bg-cinza-claro">
                      <th scope="col" className="p-2 text-left">
                        Variante
                      </th>
                      {perVariantAttrs.map((attr) => (
                        <th key={attr.key} scope="col" className="p-2 text-left">
                          {attr.unit ? `${attr.label} (${attr.unit})` : attr.label}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {variants.map((variant) => (
                      <tr key={variant.variantId} className="border-t border-slate-200">
                        <th scope="row" className="p-2 text-left font-medium">
                          {variant.label}
                          {variant.modelCode ? <span className="block text-xs text-texto-suave">{variant.modelCode}</span> : null}
                        </th>
                        {perVariantAttrs.map((attr) => (
                          <td key={attr.key} className="p-2">
                            {variant.specs?.find((row) => row.key === attr.key)?.value ?? '—'}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : null}
          </Section>

          {product.fullReview ? (
            <Section id="analise" title="Análise completa">
              <RichContent data={product.fullReview} products={reviewProducts} template={template} />
            </Section>
          ) : null}

          {related.length + similar.length > 0 ? (
            <Section id="alternativas" title="Alternativas e comparativos">
              {related.length > 0 ? (
                <ul className="mb-6 space-y-2">
                  {related.map((content) => (
                    <li key={content.id}>
                      <Link href={contentPath(content.type, content.slug!)} className="font-semibold text-azul-eletrico hover:underline">
                        {content.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : null}
              <div className="space-y-4">
                {similar.map((item) => (
                  <ProductCard key={item.id} summary={item} />
                ))}
              </div>
            </Section>
          ) : null}

          {(product.faq ?? []).length > 0 ? (
            <Section id="faq" title="Perguntas frequentes">
              <FaqList items={(product.faq ?? []).map((item) => ({ question: item.question, answer: item.answer }))} />
            </Section>
          ) : null}

          <SourcesList sources={(product.sources ?? []).map((item) => ({ title: item.title, url: item.url }))} />
        </div>

        <aside className="lg:sticky lg:top-6 lg:self-start">
          <DecisionBox variants={variants} referenceVariantId={reference?.variantId ?? null} />
          <AdSlot placement="sidebar" enabled={adsEnabled} />
        </aside>
      </div>
      <MobileDecisionBar score={product.finalScore ?? null} variant={reference} />
    </div>
  )
}
