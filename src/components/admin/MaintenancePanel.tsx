import type { ServerProps } from 'payload'

import {
  adminListUrl,
  contentsToReviewWhere,
  productsToReviewWhere,
  productsWithoutActiveOfferWhere,
  staleOffersWhere,
} from '../../catalog/maintenance'

// Exibido no início do painel (spec §8.4)
export async function MaintenancePanel({ payload }: Pick<ServerProps, 'payload'>) {
  const now = new Date()
  const checks = [
    { label: 'Ofertas desatualizadas (verificadas há mais de 30 dias)', collection: 'offers', where: staleOffersWhere(now) },
    { label: 'Produtos publicados sem oferta ativa', collection: 'products', where: productsWithoutActiveOfferWhere() },
    { label: 'Produtos a revisar (revisados há mais de 6 meses)', collection: 'products', where: productsToReviewWhere(now) },
    { label: 'Conteúdos a revisar (revisados há mais de 6 meses)', collection: 'contents', where: contentsToReviewWhere(now) },
  ] as const
  const counts = await Promise.all(checks.map((check) => payload.count({ collection: check.collection, where: check.where })))
  const items = checks.map((check, index) => ({
    label: check.label,
    count: counts[index].totalDocs,
    href: adminListUrl(check.collection, check.where),
  }))
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
