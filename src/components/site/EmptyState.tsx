import Link from 'next/link'
import type { ReactNode } from 'react'

export function EmptyState({ title, children, action }: { title: string; children?: ReactNode; action?: { label: string; href: string } }) {
  return (
    <div className="mt-8 rounded-xl border border-dashed border-slate-300 bg-cinza-claro p-8 text-center">
      <p className="text-lg font-bold">{title}</p>
      {children ? <div className="mt-2 text-texto-suave">{children}</div> : null}
      {action ? (
        <Link href={action.href} className="mt-4 inline-block font-semibold text-azul-eletrico hover:underline">
          {action.label}
        </Link>
      ) : null}
    </div>
  )
}
