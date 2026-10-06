'use client'

import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useId, useState, type KeyboardEvent } from 'react'

import type { SuggestionGroup } from '@/content/search-suggestions'

// Busca do cabeçalho (spec §6.9): sem JavaScript é um formulário GET para /busca/; com JavaScript,
// sugestões a partir de 2 letras. hideOnHomeUntilScroll (busca do cabeçalho no computador): na home,
// só aparece depois que a busca principal sai da tela.
export function SearchBox({ className = '', hideOnHomeUntilScroll = false }: { className?: string; hideOnHomeUntilScroll?: boolean }) {
  const pathname = usePathname()
  const router = useRouter()
  const listId = useId()
  const [term, setTerm] = useState('')
  const [groups, setGroups] = useState<SuggestionGroup[]>([])
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(-1)
  const [heroVisible, setHeroVisible] = useState(true)
  const onHome = hideOnHomeUntilScroll && pathname === '/'

  useEffect(() => {
    const query = term.trim()
    if (query.length < 2) return
    const controller = new AbortController()
    const timer = setTimeout(async () => {
      try {
        const response = await fetch(`/busca/sugestoes/?q=${encodeURIComponent(query)}`, { signal: controller.signal })
        if (!response.ok) return
        const data = (await response.json()) as { groups?: SuggestionGroup[] }
        setGroups(data.groups ?? [])
        setActive(-1)
        setOpen(true)
      } catch {
        // pedido cancelado ou rede fora: sem sugestões
      }
    }, 200)
    return () => {
      clearTimeout(timer)
      controller.abort()
    }
  }, [term])

  useEffect(() => {
    if (!onHome || typeof IntersectionObserver === 'undefined') return
    const hero = document.getElementById('busca-principal')
    if (!hero) return
    const observer = new IntersectionObserver(([entry]) => setHeroVisible(entry.isIntersecting))
    observer.observe(hero)
    return () => observer.disconnect()
  }, [onHome])

  const options = groups.flatMap((group) => group.items)
  const expanded = open && options.length > 0
  const optionId = (index: number) => `${listId}-opcao-${index}`

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'ArrowDown' && options.length > 0) {
      event.preventDefault()
      setOpen(true)
      setActive((index) => Math.min(index + 1, options.length - 1))
    } else if (event.key === 'ArrowUp' && options.length > 0) {
      event.preventDefault()
      setActive((index) => Math.max(index - 1, -1))
    } else if (event.key === 'Enter' && expanded && active >= 0) {
      event.preventDefault()
      setOpen(false)
      router.push(options[active].href)
    } else if (event.key === 'Escape') {
      setOpen(false)
      setActive(-1)
    }
  }

  let index = -1
  return (
    <form action="/busca/" method="get" role="search" className={`relative ${onHome && heroVisible ? 'invisible' : ''} ${className}`}>
      <input
        type="search"
        name="q"
        role="combobox"
        aria-label="Buscar no DeciCompra"
        aria-autocomplete="list"
        aria-expanded={expanded}
        aria-controls={listId}
        aria-activedescendant={expanded && active >= 0 ? optionId(active) : undefined}
        autoComplete="off"
        maxLength={80}
        placeholder="Buscar produto, marca…"
        value={term}
        onChange={(event) => {
          const value = event.target.value
          setTerm(value)
          if (value.trim().length < 2) {
            setGroups([])
            setOpen(false)
          }
        }}
        onKeyDown={onKeyDown}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        className="w-full rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-sm text-branco placeholder:text-blue-200"
      />
      {expanded ? (
        <div id={listId} role="listbox" aria-label="Sugestões" className="absolute inset-x-0 top-full z-50 mt-1 rounded-lg bg-branco p-2 text-texto shadow-lg">
          {groups.map((group) => (
            <div key={group.type} role="group" aria-label={group.label}>
              <div role="presentation" className="px-2 pt-2 text-xs font-semibold uppercase tracking-wide text-texto-suave">
                {group.label}
              </div>
              {group.items.map((item) => {
                index++
                const current = index
                return (
                  <a
                    key={item.href}
                    id={optionId(current)}
                    role="option"
                    aria-selected={current === active}
                    href={item.href}
                    tabIndex={-1}
                    // Mantém o foco no campo: a lista não fecha (onBlur) antes de o clique navegar
                    onMouseDown={(event) => event.preventDefault()}
                    className={`block rounded px-2 py-2 text-sm ${current === active ? 'bg-cinza-claro font-semibold' : 'hover:bg-cinza-claro'}`}
                  >
                    {item.title}
                  </a>
                )
              })}
            </div>
          ))}
        </div>
      ) : null}
      <p role="status" className="sr-only">
        {expanded ? `${options.length} ${options.length === 1 ? 'sugestão' : 'sugestões'}` : ''}
      </p>
    </form>
  )
}
