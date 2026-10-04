import Link from 'next/link'

import { Logo } from '@/components/brand/Logo'
import { footerColumns } from '@/config/navigation'

export function SiteFooter({ year = new Date().getFullYear() }: { year?: number }) {
  return (
    <footer className="bg-azul-profundo text-blue-100">
      <div className="mx-auto grid max-w-[1280px] gap-8 px-4 py-12 sm:grid-cols-2 lg:grid-cols-5 lg:px-8">
        <div>
          <span className="text-branco">
            <Logo />
          </span>
          <p className="mt-3 text-sm">Compare. Entenda. Decida.</p>
          <p className="mt-1 text-sm">Não vendemos produtos.</p>
        </div>
        {footerColumns.map((column) => (
          <nav key={column.title} aria-label={column.title}>
            <h2 className="text-sm font-bold text-branco">{column.title}</h2>
            <ul className="mt-3 space-y-2 text-sm">
              {column.links.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="hover:text-branco hover:underline">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>
      <div className="border-t border-white/10">
        <p className="mx-auto max-w-[1280px] px-4 py-4 text-xs lg:px-8">© {year} DeciCompra</p>
      </div>
    </footer>
  )
}
