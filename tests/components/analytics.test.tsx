import { fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { AnalyticsClicks, TrackSearch } from '@/components/consent/Analytics'
import { ConsentManager } from '@/components/consent/ConsentManager'
import { StoreButtons } from '@/components/site/StoreButtons'
import { consentCookie } from '@/content/consent'

const gtag = vi.fn()

beforeEach(() => {
  gtag.mockReset()
  window.gtag = gtag
})
afterEach(() => {
  document.cookie = 'dc_consentimento=; Max-Age=0; Path=/'
  delete window.gtag
})

const allowStatistics = (statistics: boolean) => {
  document.cookie = consentCookie({ statistics, advertising: false })
}

describe('eventos do GA4 (spec §10.3)', () => {
  it('clique num botão de loja envia clique_oferta com a loja, só com consentimento de estatísticas', () => {
    allowStatistics(true)
    render(
      <>
        <AnalyticsClicks />
        <StoreButtons offers={[{ id: 10, storeId: 1, storeName: 'Loja A', href: '/ir/10/' }]} />
      </>,
    )
    const link = screen.getByRole('link', { name: 'Ver na Loja A' })
    link.addEventListener('click', (event) => event.preventDefault())
    fireEvent.click(link)
    expect(gtag).toHaveBeenCalledWith('event', 'clique_oferta', { loja: 'Loja A', oferta: '10' })
  })

  it('sem consentimento de estatísticas, nenhum evento', () => {
    allowStatistics(false)
    render(
      <>
        <AnalyticsClicks />
        <a href="#x" data-track="atalho_home" data-track-atalho="comparar">
          Em dúvida
        </a>
      </>,
    )
    fireEvent.click(screen.getByRole('link', { name: 'Em dúvida' }))
    expect(gtag).not.toHaveBeenCalled()
  })

  it('busca envia o termo e a quantidade de resultados uma vez', () => {
    allowStatistics(true)
    render(<TrackSearch term="air fryer" results={7} />)
    expect(gtag).toHaveBeenCalledTimes(1)
    expect(gtag).toHaveBeenCalledWith('event', 'busca', { search_term: 'air fryer', resultados: 7 })
  })
})

describe('AdSense (só com anúncios ligados e consentimento de publicidade)', () => {
  const setup = (advertising: boolean) => {
    document.cookie = consentCookie({ statistics: false, advertising })
    return render(
      <>
        <div data-ad-placement="content" />
        <ConsentManager ga4Id={null} adsenseClientId="ca-pub-1234567890123456" adSlots={[{ placement: 'content', slotId: '9876543210' }]} />
      </>,
    )
  }

  it('com consentimento, o espaço recebe o anúncio do slot configurado', () => {
    const { container } = setup(true)
    const ins = container.querySelector('[data-ad-placement="content"] ins.adsbygoogle')
    expect(ins?.getAttribute('data-ad-client')).toBe('ca-pub-1234567890123456')
    expect(ins?.getAttribute('data-ad-slot')).toBe('9876543210')
  })

  it('sem consentimento, o espaço continua vazio', () => {
    const { container } = setup(false)
    expect(container.querySelector('ins.adsbygoogle')).toBeNull()
  })
})
