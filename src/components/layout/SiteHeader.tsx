import Link from 'next/link'

import { Logo } from '@/components/brand/Logo'
import { mainNav, type NavLink } from '@/config/navigation'
import type { PublicCategory } from '@/lib/data/lists'

import { CategoriesMenu } from './CategoriesMenu'
import { MobileMenu } from './MobileMenu'
import { SearchBox } from './SearchBox'

const CATEGORIES_HREF = '/categorias/'

export function SiteHeader({ links = mainNav, categories = [] }: { links?: NavLink[]; categories?: PublicCategory[] }) {
  return (
    <header className="superficie-escura relative bg-azul-profundo text-branco">
      <div className="mx-auto flex h-16 max-w-[1280px] items-center justify-between gap-6 px-4 lg:px-8">
        <Link href="/" aria-label="DeciCompra, página inicial" className="rounded-md">
          <Logo />
        </Link>
        <nav aria-label="Principal" className="hidden lg:block">
          <ul className="flex items-center gap-7 text-sm font-medium">
            {links.map((link) => (
              <li key={link.href}>
                {link.href === CATEGORIES_HREF && categories.length > 0 ? (
                  <CategoriesMenu label={link.label} categories={categories} />
                ) : (
                  <Link href={link.href} className="rounded-sm py-2 hover:text-blue-200">
                    {link.label}
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </nav>
        <SearchBox className="hidden w-full max-w-xs md:block" />
        <MobileMenu links={links} categories={categories} />
      </div>
    </header>
  )
}
