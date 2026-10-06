import type { Metadata } from 'next'

import { ContentIndex, contentIndexMetadata, type IndexSearchParams } from '@/components/site/ContentIndex'

type Props = { searchParams: IndexSearchParams }

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  return contentIndexMetadata('entenda', searchParams)
}

export default function ExplainersIndexPage({ searchParams }: Props) {
  return <ContentIndex type="entenda" searchParams={searchParams} />
}
