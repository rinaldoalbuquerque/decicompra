import type { ProductSummary } from '@/content/view-models'

import { ProductCard } from './ProductCard'

export function ProductGrid({ items }: { items: ProductSummary[] }) {
  return (
    <ul className="grid gap-4 lg:grid-cols-2">
      {items.map((item) => (
        <li key={item.id}>
          <ProductCard summary={item} />
        </li>
      ))}
    </ul>
  )
}
