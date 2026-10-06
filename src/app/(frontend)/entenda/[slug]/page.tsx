import type { Metadata } from 'next'

import { ContentArticle } from '@/components/site/ContentArticle'
import { contentPath } from '@/content/paths'
import { getPublicContent } from '@/lib/data/contents'
import { notFoundOrRedirect } from '@/lib/data/redirects'

export const revalidate = 3600
export const dynamicParams = true

export async function generateStaticParams() {
  return []
}

type Params = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params
  const content = await getPublicContent('entenda', slug)
  if (!content) return {}
  return { title: content.seo?.metaTitle || content.title, description: content.seo?.metaDescription || content.summary || undefined }
}

export default async function ExplainerPage({ params }: Params) {
  const { slug } = await params
  const content = await getPublicContent('entenda', slug)
  if (!content) return notFoundOrRedirect(contentPath('entenda', slug))
  return <ContentArticle content={content} />
}
