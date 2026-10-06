'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'

import { consentCookie, consentSignals, readConsent, type Consent } from '@/content/consent'

declare global {
  interface Window {
    dataLayer?: unknown[]
    gtag?: (...args: unknown[]) => void
    adsbygoogle?: unknown[]
  }
}

export type AdSlotConfig = { placement: string; slotId: string }

export const OPEN_PREFERENCES_EVENT = 'dc:preferencias-cookies'

function loadScript(src: string) {
  if (document.querySelector(`script[src="${src}"]`)) return
  const script = document.createElement('script')
  script.async = true
  script.src = src
  script.crossOrigin = 'anonymous'
  document.head.appendChild(script)
}

// Preenche os espaços reservados (AdSlot) com o anúncio do slot configurado para a posição
function fillAdSlots(clientId: string, slots: AdSlotConfig[]) {
  for (const holder of document.querySelectorAll<HTMLElement>('[data-ad-placement]')) {
    const slot = slots.find((item) => item.placement === holder.dataset.adPlacement)
    if (!slot || holder.querySelector('ins.adsbygoogle')) continue
    const ins = document.createElement('ins')
    ins.className = 'adsbygoogle'
    ins.style.display = 'block'
    ins.dataset.adClient = clientId
    ins.dataset.adSlot = slot.slotId
    ins.dataset.adFormat = 'auto'
    ins.dataset.fullWidthResponsive = 'true'
    holder.appendChild(ins)
    ;(window.adsbygoogle = window.adsbygoogle || []).push({})
  }
}

// IDs do GA4 já configurados nesta página: o config roda uma vez só. As navegações seguintes são
// contadas pela medição otimizada do GA4 (mudanças de histórico), sem page_view em dobro.
const configuredGa4 = new Set<string>()

// Revogação: apaga os cookies do Google Analytics no domínio atual e no domínio-pai
function clearAnalyticsCookies() {
  const host = location.hostname
  const domains = [host, host.split('.').slice(-2).join('.'), host.split('.').slice(-3).join('.')]
  for (const name of document.cookie.split(';').map((part) => part.split('=')[0].trim())) {
    if (!name.startsWith('_ga')) continue
    for (const domain of new Set(domains)) document.cookie = `${name}=; Max-Age=0; Path=/; Domain=${domain}`
    document.cookie = `${name}=; Max-Age=0; Path=/`
  }
}

// Aplica a escolha: atualiza o Consent Mode e só então carrega o que foi permitido (spec §10.3)
function apply(consent: Consent, ga4Id: string | null, adsenseClientId: string | null, adSlots: AdSlotConfig[]) {
  window.gtag?.('consent', 'update', consentSignals(consent))
  if (consent.statistics && ga4Id && !configuredGa4.has(ga4Id)) {
    configuredGa4.add(ga4Id)
    loadScript(`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(ga4Id)}`)
    window.gtag?.('js', new Date())
    window.gtag?.('config', ga4Id)
  }
  if (consent.advertising && adsenseClientId) {
    loadScript(`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${encodeURIComponent(adsenseClientId)}`)
    fillAdSlots(adsenseClientId, adSlots)
  }
}

// Aviso de cookies próprio: Necessários (sempre), Estatísticas e Publicidade. Reaberto pelo rodapé.
export function ConsentManager({
  ga4Id,
  adsenseClientId,
  adSlots = [],
}: {
  ga4Id: string | null
  adsenseClientId: string | null
  adSlots?: AdSlotConfig[]
}) {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const [customizing, setCustomizing] = useState(false)
  const [statistics, setStatistics] = useState(false)
  const [advertising, setAdvertising] = useState(false)

  useEffect(() => {
    const saved = readConsent(document.cookie)
    if (saved) apply(saved, ga4Id, adsenseClientId, adSlots)
    // Sem escolha guardada: o aviso aparece (decidido no navegador, onde o cookie existe)
    const timer = saved ? null : setTimeout(() => setOpen(true), 0)
    const reopen = () => {
      const current = readConsent(document.cookie)
      setStatistics(current?.statistics ?? false)
      setAdvertising(current?.advertising ?? false)
      setCustomizing(true)
      setOpen(true)
    }
    window.addEventListener(OPEN_PREFERENCES_EVENT, reopen)
    return () => {
      if (timer) clearTimeout(timer)
      window.removeEventListener(OPEN_PREFERENCES_EVENT, reopen)
    }
    // A cada navegação os espaços da nova página também são preenchidos (pathname nas dependências)
  }, [ga4Id, adsenseClientId, adSlots, pathname])

  const decide = (choice: { statistics: boolean; advertising: boolean }) => {
    const previous = readConsent(document.cookie)
    document.cookie = consentCookie(choice)
    // Revogou o que já tinha permitido: os scripts do Google já carregados não "descarregam". Apaga os
    // cookies de estatísticas e recarrega a página, que volta sem nada carregado.
    if ((previous?.statistics && !choice.statistics) || (previous?.advertising && !choice.advertising)) {
      window.gtag?.('consent', 'update', consentSignals({ ...choice, decidedAt: '' }))
      clearAnalyticsCookies()
      location.reload()
      return
    }
    const saved = readConsent(document.cookie)
    if (saved) apply(saved, ga4Id, adsenseClientId, adSlots)
    setOpen(false)
    setCustomizing(false)
  }

  if (!open) return null
  return (
    <section
      aria-label="Aviso de cookies"
      className="fixed inset-x-0 bottom-0 z-50 border-t border-slate-200 bg-branco p-4 text-sm text-texto shadow-[0_-4px_16px_rgba(0,0,0,0.12)]"
    >
      <div className="mx-auto max-w-[1280px] space-y-3">
        <p>
          Usamos cookies necessários para o site funcionar. Com a sua permissão, também usamos cookies de estatísticas (para entender o uso
          do site) e de publicidade.{' '}
          <Link href="/cookies/" className="underline">
            Saiba mais
          </Link>
          .
        </p>
        {customizing ? (
          <fieldset className="space-y-2">
            <legend className="font-semibold">Escolha as categorias</legend>
            <label className="flex items-center gap-2">
              <input type="checkbox" checked disabled /> Necessários (sempre ativos)
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={statistics} onChange={(event) => setStatistics(event.target.checked)} /> Estatísticas (Google
              Analytics)
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={advertising} onChange={(event) => setAdvertising(event.target.checked)} /> Publicidade (Google
              AdSense)
            </label>
          </fieldset>
        ) : null}
        <div className="flex flex-wrap gap-2">
          {customizing ? (
            <button type="button" onClick={() => decide({ statistics, advertising })} className="rounded-lg bg-azul-profundo px-4 py-2 font-semibold text-branco">
              Salvar escolhas
            </button>
          ) : (
            <button type="button" onClick={() => setCustomizing(true)} className="rounded-lg border border-slate-300 px-4 py-2 font-semibold">
              Personalizar
            </button>
          )}
          <button type="button" onClick={() => decide({ statistics: false, advertising: false })} className="rounded-lg border border-slate-300 px-4 py-2 font-semibold">
            Recusar opcionais
          </button>
          <button type="button" onClick={() => decide({ statistics: true, advertising: true })} className="rounded-lg bg-verde px-4 py-2 font-semibold text-azul-profundo">
            Aceitar todos
          </button>
        </div>
      </div>
    </section>
  )
}

// Link "Preferências de cookies" do rodapé (spec §6.1, item 11)
export function CookiePreferencesButton({ className = '' }: { className?: string }) {
  return (
    <button type="button" onClick={() => window.dispatchEvent(new Event(OPEN_PREFERENCES_EVENT))} className={className}>
      Preferências de cookies
    </button>
  )
}
