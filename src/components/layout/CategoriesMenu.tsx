'use client'

import Link from 'next/link'
import { useEffect, useId, useRef, useState } from 'react'

import { categoryPath } from '@/content/paths'
import type { PublicCategory } from '@/lib/data/lists'

// "Categorias ▾" (spec §6.1): só categorias e subcategorias com item público
export function CategoriesMenu({ label, categories }: { label: string; categories: PublicCategory[] }) {
  const [open, setOpen] = useState(false)
  const panelId = useId()
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }
    const onClick = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false)
    }
    document.addEventListener('keydown', onKeyDown)
    document.addEventListener('click', onClick)
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.removeEventListener('click', onClick)
    }
  }, [open])

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((value) => !value)}
        className="flex items-center gap-1 rounded-sm py-2 hover:text-blue-200"
      >
        {label}
        <span aria-hidden="true">▾</span>
      </button>
      <div id={panelId} hidden={!open} className="absolute left-0 top-full z-50 mt-2 w-[min(90vw,640px)] rounded-xl bg-branco p-5 text-texto shadow-xl">
        <ul className="grid gap-5 sm:grid-cols-2">
          {categories.map((category) => (
            <li key={category.id}>
              <Link href={categoryPath(category.slug)} onClick={() => setOpen(false)} className="font-bold hover:text-azul-eletrico">
                {category.name}
              </Link>
              <ul className="mt-2 space-y-1 text-sm">
                {category.subcategories.map((sub) => (
                  <li key={sub.id}>
                    <Link href={categoryPath(sub.slug, category.slug)} onClick={() => setOpen(false)} className="hover:text-azul-eletrico hover:underline">
                      {sub.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
        <Link href="/categorias/" onClick={() => setOpen(false)} className="mt-5 inline-block text-sm font-semibold text-azul-eletrico hover:underline">
          Ver todas as categorias
        </Link>
      </div>
    </div>
  )
}
