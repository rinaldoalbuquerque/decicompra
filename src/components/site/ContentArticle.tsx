import Link from 'next/link'

import type { SpecAttribute } from '@/catalog/spec-template'
import { categoryPath, CONTENT_PREFIX } from '@/content/paths'
import { extractHeadings } from '@/content/rich-text'
import { extractProductIds } from '@/content/rules'
import { getProductSummaries } from '@/lib/data/products'
import { getAdsEnabled } from '@/lib/data/settings'
import type { Category, Content } from '@/payload-types'

import { AdSlot } from './AdSlot'
import { PAGE_CONTAINER, PageHeader, QuickSummary, SourcesList } from './blocks'
import { RichContent } from './RichContent'

const TYPE_LABEL: Record<Content['type'], string> = {
  melhores: 'Melhores',
  comparativo: 'Comparativos',
  guia: 'Guias',
  entenda: 'Entenda',
}

// Guia e Entenda (spec §6.7): resumo rápido, índice, corpo com blocos, fontes e relacionados
export async function ContentArticle({ content }: { content: Content }) {
  const subcategory = typeof content.primarySubcategory === 'object' ? (content.primarySubcategory as Category) : null
  const category = subcategory && typeof subcategory.parent === 'object' ? (subcategory.parent as Category) : null
  const [products, adsEnabled] = await Promise.all([getProductSummaries(extractProductIds({ body: content.body })), getAdsEnabled()])
  const headings = extractHeadings(content.body)
  const hasOffers = [...products.values()].some((item) => (item.reference?.offers.length ?? 0) > 0)

  return (
    <div className={PAGE_CONTAINER}>
      <article className="mx-auto max-w-[760px]">
        <PageHeader
          breadcrumbs={[
            { label: 'Início', href: '/' },
            ...(category?.slug ? [{ label: category.name, href: categoryPath(category.slug) }] : []),
            ...(subcategory?.slug ? [{ label: subcategory.name, href: categoryPath(subcategory.slug, category?.slug) }] : []),
            { label: TYPE_LABEL[content.type], href: CONTENT_PREFIX[content.type] },
          ]}
          title={content.title}
          reviewedAt={content.reviewedAt}
          authorName={typeof content.author === 'object' ? content.author?.name : null}
          withAffiliateNotice={hasOffers}
        />

        {content.summary ? (
          <div className="mt-6">
            <QuickSummary>
              <p className="text-lg">{content.summary}</p>
            </QuickSummary>
          </div>
        ) : null}

        {headings.length > 1 ? (
          <nav aria-label="Nesta página" className="mt-6 rounded-lg border border-slate-200 p-4 text-sm">
            <p className="mb-2 font-bold">Nesta página</p>
            <ol className="space-y-1">
              {headings.map((heading) => (
                <li key={heading.id} className={heading.level === 3 ? 'pl-4' : undefined}>
                  <a href={`#${heading.id}`} className="text-azul-eletrico hover:underline">
                    {heading.text}
                  </a>
                </li>
              ))}
            </ol>
          </nav>
        ) : null}

        <AdSlot placement="content" enabled={adsEnabled} />

        <div className="mt-6">
          <RichContent data={content.body} products={products} template={(subcategory?.specTemplate ?? []) as unknown as SpecAttribute[]} />
        </div>

        <SourcesList sources={(content.sources ?? []).map((item) => ({ title: item.title, url: item.url }))} />

        {subcategory?.slug ? (
          <p className="mt-10 border-t border-slate-200 pt-6">
            Mais sobre{' '}
            <Link href={categoryPath(subcategory.slug, category?.slug)} className="font-semibold text-azul-eletrico hover:underline">
              {subcategory.name}
            </Link>
          </p>
        ) : null}
      </article>
    </div>
  )
}
