import { describe, expect, it } from 'vitest'

import { withContext } from '@/lib/hook-context'

describe('withContext', () => {
  it('liga as marcas só durante a chamada e restaura as anteriores', async () => {
    const req = { context: { existente: 1, cascade: false } } as never as { context: Record<string, unknown> }
    const during = await withContext(req as never, { cascade: true, skipPublicationCheck: true }, async () => ({ ...req.context }))
    expect(during).toEqual({ existente: 1, cascade: true, skipPublicationCheck: true })
    expect(req.context).toEqual({ existente: 1, cascade: false })
  })

  it('restaura mesmo quando a chamada falha', async () => {
    const req = { context: {} } as { context: Record<string, unknown> }
    await expect(
      withContext(req as never, { cascade: true }, async () => {
        throw new Error('falhou')
      }),
    ).rejects.toThrow('falhou')
    expect(req.context).toEqual({})
  })

  it('cria o contexto quando não existe', async () => {
    const req = {} as { context?: Record<string, unknown> }
    await withContext(req as never, { cascade: true }, async () => expect(req.context).toEqual({ cascade: true }))
    expect(req.context).toEqual({})
  })

  it('desfaz a marca mesmo se a chamada interna trocar req.context por uma cópia (como o Payload faz)', async () => {
    const req = { context: { existente: 1 } } as { context: Record<string, unknown> }
    await withContext(req as never, { cascade: true }, async () => {
      req.context = { ...req.context, outra: 2 }
    })
    expect(req.context.cascade).toBeUndefined()
    expect(req.context.existente).toBe(1)
  })
})
