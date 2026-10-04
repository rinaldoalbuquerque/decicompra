import type { ServerProps } from 'payload'

import { adminListUrl, productsWithoutActiveOfferWhere, staleOffersWhere } from '../../catalog/maintenance'

// Exibido no início do painel (spec §8.4)
export async function MaintenancePanel({ payload }: Pick<ServerProps, 'payload'>) {
  const now = new Date()
  const staleWhere = staleOffersWhere(now)
  const noOfferWhere = productsWithoutActiveOfferWhere()
  const [stale, noOffer] = await Promise.all([
    payload.count({ collection: 'offers', where: staleWhere }),
    payload.count({ collection: 'products', where: noOfferWhere }),
  ])
  const items = [
    { label: 'Ofertas desatualizadas (verificadas há mais de 30 dias)', count: stale.totalDocs, href: adminListUrl('offers', staleWhere) },
    { label: 'Produtos publicados sem oferta ativa', count: noOffer.totalDocs, href: adminListUrl('products', noOfferWhere) },
  ]
  return (
    <section
      aria-labelledby="manutencao-titulo"
      style={{ border: '1px solid var(--theme-elevation-150)', borderRadius: 8, padding: '16px 20px', marginBottom: 24 }}
    >
      <h2 id="manutencao-titulo" style={{ margin: '0 0 8px', fontSize: 18 }}>
        Manutenção
      </h2>
      <ul style={{ margin: 0, paddingLeft: 18 }}>
        {items.map((item) => (
          <li key={item.href} style={{ margin: '4px 0' }}>
            <a href={item.href}>
              {item.label}: <strong>{item.count}</strong>
            </a>
          </li>
        ))}
      </ul>
    </section>
  )
}
