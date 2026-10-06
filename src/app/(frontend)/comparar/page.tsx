import type { Metadata } from 'next'

import { ContentIndex, contentIndexMetadata, type IndexSearchParams } from '@/components/site/ContentIndex'

type Props = { searchParams: IndexSearchParams }

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  return contentIndexMetadata('comparativo', searchParams)
}

export default function ComparisonsIndexPage({ searchParams }: Props) {
  return <ContentIndex type="comparativo" searchParams={searchParams} />
}
