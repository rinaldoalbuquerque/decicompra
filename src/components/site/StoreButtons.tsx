import Link from 'next/link'

import type { OfferLink } from '@/content/view-models'

// Botões de loja (spec §5.3 e §7.5): "Ver na {loja}", nunca "Comprar"; sempre com o aviso de comissão
export function StoreButtons({ offers, stale = false, compact = false }: { offers: OfferLink[]; stale?: boolean; compact?: boolean }) {
  if (offers.length === 0) return null
  return (
    <div className="space-y-2">
      <ul className={compact ? 'flex flex-wrap gap-2' : 'space-y-2'}>
        {offers.map((offer) => (
          <li key={offer.id}>
            <a
              href={offer.href}
              rel="sponsored nofollow noopener"
              target="_blank"
              data-track="clique_oferta"
              data-track-loja={offer.storeName}
              data-track-oferta={String(offer.id)}
              className={`block rounded-lg bg-azul-eletrico px-4 text-center font-semibold text-branco hover:bg-blue-700 ${compact ? 'py-1.5 text-sm' : 'py-2.5'}`}
            >
              {stale ? `Ver preço na ${offer.storeName}` : `Ver na ${offer.storeName}`}
            </a>
          </li>
        ))}
      </ul>
      <p className="text-xs text-texto-suave">
        Podemos receber comissão.{' '}
        <Link href="/divulgacao-de-afiliados/" className="underline">
          Saiba mais
        </Link>
      </p>
    </div>
  )
}
