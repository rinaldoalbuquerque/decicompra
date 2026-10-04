import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { MaintenancePanel } from '@/components/admin/MaintenancePanel'

describe('MaintenancePanel', () => {
  it('mostra as contagens com links para as listas filtradas', async () => {
    const count = vi.fn().mockResolvedValueOnce({ totalDocs: 3 }).mockResolvedValueOnce({ totalDocs: 0 })
    render(await MaintenancePanel({ payload: { count } } as never))

    const stale = screen.getByRole('link', { name: /Ofertas desatualizadas/ })
    expect(stale.textContent).toContain('3')
    expect(decodeURIComponent(stale.getAttribute('href') ?? '')).toContain('/admin/collections/offers?where[and][0][status][equals]=active')

    const noOffer = screen.getByRole('link', { name: /sem oferta ativa/ })
    expect(noOffer.textContent).toContain('0')
    expect(count).toHaveBeenCalledTimes(2)
  })
})
