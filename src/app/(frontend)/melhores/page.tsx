import type { Metadata } from 'next'

import { ContentIndex, contentIndexMetadata, type IndexSearchParams } from '@/components/site/ContentIndex'

type Props = { searchParams: IndexSearchParams }

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  return contentIndexMetadata('melhores', searchParams)
}

export default function BestIndexPage({ searchParams }: Props) {
  return <ContentIndex type="melhores" searchParams={searchParams} />
}
