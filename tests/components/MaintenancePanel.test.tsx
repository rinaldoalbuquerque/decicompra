import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { MaintenancePanel } from '@/components/admin/MaintenancePanel'

describe('MaintenancePanel', () => {
  it('mostra as 4 contagens com links para as listas filtradas', async () => {
    const count = vi
      .fn()
      .mockResolvedValueOnce({ totalDocs: 3 })
      .mockResolvedValueOnce({ totalDocs: 0 })
      .mockResolvedValueOnce({ totalDocs: 5 })
      .mockResolvedValueOnce({ totalDocs: 2 })
    render(await MaintenancePanel({ payload: { count } } as never))

    const stale = screen.getByRole('link', { name: /Ofertas desatualizadas/ })
    expect(stale.textContent).toContain('3')
    expect(decodeURIComponent(stale.getAttribute('href') ?? '')).toContain('/admin/collections/offers?where[and][0][status][equals]=active')
    expect(screen.getByRole('link', { name: /sem oferta ativa/ }).textContent).toContain('0')
    expect(screen.getByRole('link', { name: /Produtos a revisar/ }).textContent).toContain('5')
    const contents = screen.getByRole('link', { name: /Conteúdos a revisar/ })
    expect(contents.textContent).toContain('2')
    expect(contents.getAttribute('href')).toContain('/admin/collections/contents?')
    expect(count).toHaveBeenCalledTimes(4)
  })
})
