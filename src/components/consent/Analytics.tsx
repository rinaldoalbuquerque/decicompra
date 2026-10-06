'use client'

import { useEffect, useRef } from 'react'

import { readConsent } from '@/content/consent'

// Evento do GA4 (spec §10.3): só com consentimento de estatísticas
export function track(event: string, params: Record<string, string | number>) {
  if (!readConsent(document.cookie)?.statistics) return
  window.gtag?.('event', event, params)
}

// Cliques em elementos marcados com data-track="evento" e data-track-{parâmetro}="valor"
// (botões de loja → clique_oferta; atalhos da home → atalho_home)
export function AnalyticsClicks() {
  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      const element = (event.target as Element | null)?.closest<HTMLElement>('[data-track]')
      if (!element?.dataset.track) return
      const params = Object.fromEntries(
        Object.entries(element.dataset)
          .filter(([key, value]) => key.startsWith('track') && key !== 'track' && value !== undefined)
          .map(([key, value]) => [key.slice('track'.length).toLowerCase(), value as string]),
      )
      track(element.dataset.track, params)
    }
    document.addEventListener('click', onClick, { capture: true })
    return () => document.removeEventListener('click', onClick, { capture: true })
  }, [])
  return null
}

// Busca feita (página /busca/): termo e quantidade de resultados, uma vez por termo
export function TrackSearch({ term, results }: { term: string; results: number }) {
  const sent = useRef<string | null>(null)
  useEffect(() => {
    if (!term || sent.current === term) return
    sent.current = term
    track('busca', { search_term: term, resultados: results })
  }, [term, results])
  return null
}
