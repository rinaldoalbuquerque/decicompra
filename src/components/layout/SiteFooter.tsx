import Link from 'next/link'

import { Logo } from '@/components/brand/Logo'
import { CookiePreferencesButton } from '@/components/consent/ConsentManager'
import { footerColumns, type FooterColumn } from '@/config/navigation'

export function SiteFooter({
  year = new Date().getFullYear(),
  columns = footerColumns,
}: {
  year?: number
  columns?: FooterColumn[]
}) {
  return (
    <footer className="superficie-escura bg-azul-profundo text-blue-100">
      <div className="mx-auto grid max-w-[1280px] gap-8 px-4 py-12 sm:grid-cols-2 lg:grid-cols-5 lg:px-8">
        <div>
          <span className="text-branco">
            <Logo />
          </span>
          <p className="mt-3 text-sm">Compare. Entenda. Decida.</p>
          <p className="mt-1 text-sm">Não vendemos produtos.</p>
        </div>
        {columns.map((column) => (
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
        <div className="mx-auto flex max-w-[1280px] flex-wrap items-center justify-between gap-2 px-4 py-4 text-xs lg:px-8">
          <p>© {year} DeciCompra</p>
          <CookiePreferencesButton className="underline hover:text-branco" />
        </div>
      </div>
    </footer>
  )
}
