import type { Metadata } from 'next'

import { ContentIndex, contentIndexMetadata, type IndexSearchParams } from '@/components/site/ContentIndex'

type Props = { searchParams: IndexSearchParams }

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  return contentIndexMetadata('guia', searchParams)
}

export default function GuidesIndexPage({ searchParams }: Props) {
  return <ContentIndex type="guia" searchParams={searchParams} />
}
