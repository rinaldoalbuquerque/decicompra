import Link from 'next/link'

import { formatDate } from '@/lib/format'

// Linha de transparência (spec §6): revisão, autoria e, quando há ofertas, o aviso de comissão
export function TransparencyLine({
  reviewedAt,
  authorName,
  withAffiliateNotice = false,
}: {
  reviewedAt?: string | null
  authorName?: string | null
  withAffiliateNotice?: boolean
}) {
  const parts = [
    reviewedAt ? `Revisado em ${formatDate(reviewedAt)}` : null,
    authorName ?? 'Equipe DeciCompra',
    withAffiliateNotice ? 'Podemos receber comissão' : null,
  ].filter(Boolean)
  return (
    <p className="text-sm text-texto-suave">
      {parts.join(' · ')}
      {withAffiliateNotice ? (
        <>
          {' '}
          (
          <Link href="/divulgacao-de-afiliados/" className="underline">
            saiba mais
          </Link>
          )
        </>
      ) : null}
    </p>
  )
}
