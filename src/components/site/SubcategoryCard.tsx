import Link from 'next/link'

// Cartão de subcategoria (home, categoria, /categorias/)
export function SubcategoryCard({
  href,
  name,
  description,
  icon,
}: {
  href: string
  name: string
  description?: string | null
  icon?: string | null
}) {
  return (
    <Link href={href} className="flex h-full gap-3 rounded-xl border border-slate-200 bg-branco p-4 hover:border-azul-eletrico">
      {icon ? (
        <span aria-hidden="true" className="text-2xl">
          {icon}
        </span>
      ) : null}
      <span>
        <span className="block font-bold">{name}</span>
        {description ? <span className="mt-1 block text-sm text-texto-suave">{description}</span> : null}
      </span>
    </Link>
  )
}
