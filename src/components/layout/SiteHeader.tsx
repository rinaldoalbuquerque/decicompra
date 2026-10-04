import Link from 'next/link'

import { Logo } from '@/components/brand/Logo'
import { mainNav } from '@/config/navigation'

import { MobileMenu } from './MobileMenu'

export function SiteHeader() {
  return (
    <header className="relative bg-azul-profundo text-branco">
      <div className="mx-auto flex h-16 max-w-[1280px] items-center justify-between gap-6 px-4 lg:px-8">
        <Link href="/" aria-label="DeciCompra, página inicial" className="rounded-md">
          <Logo />
        </Link>
        <nav aria-label="Principal" className="hidden lg:block">
          <ul className="flex items-center gap-7 text-sm font-medium">
            {mainNav.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="rounded-sm py-2 hover:text-blue-200">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <MobileMenu links={mainNav} />
      </div>
    </header>
  )
}
