import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { ContentArticle } from '@/components/site/ContentArticle'
import { getPublicContent } from '@/lib/data/contents'

export const revalidate = 3600
export const dynamicParams = true

export async function generateStaticParams() {
  return []
}

type Params = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params
  const content = await getPublicContent('guia', slug)
  if (!content) return {}
  return { title: content.seo?.metaTitle || content.title, description: content.seo?.metaDescription || content.summary || undefined }
}

export default async function GuidePage({ params }: Params) {
  const { slug } = await params
  const content = await getPublicContent('guia', slug)
  if (!content) notFound()
  return <ContentArticle content={content} />
}
