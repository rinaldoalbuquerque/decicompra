import { describe, expect, it } from 'vitest'

import {
  adminOnly,
  adminOrEditor,
  adminOrSelf,
  loggedIn,
  readPublishedProducts,
  roleForNewUser,
  roleOf,
  updateProducts,
} from '@/access'

const req = (user: unknown) => ({ req: { user } }) as never

describe('roleOf', () => {
  it('lê o papel válido e ignora o resto', () => {
    expect(roleOf({ role: 'editor' })).toBe('editor')
    expect(roleOf({ role: 'chefe' })).toBeNull()
    expect(roleOf(null)).toBeNull()
  })
})

describe('roleForNewUser', () => {
  it('o primeiro usuário é sempre administrador', () => {
    expect(roleForNewUser('redator', 0)).toBe('admin')
    expect(roleForNewUser(undefined, 0)).toBe('admin')
  })

  it('depois, usa o papel pedido ou redator', () => {
    expect(roleForNewUser('editor', 3)).toBe('editor')
    expect(roleForNewUser(undefined, 3)).toBe('redator')
  })
})

describe('funções de acesso', () => {
  it('adminOnly, adminOrEditor e loggedIn', () => {
    expect(adminOnly(req({ role: 'admin' }))).toBe(true)
    expect(adminOnly(req({ role: 'editor' }))).toBe(false)
    expect(adminOrEditor(req({ role: 'editor' }))).toBe(true)
    expect(adminOrEditor(req({ role: 'redator' }))).toBe(false)
    expect(loggedIn(req({ role: 'redator' }))).toBe(true)
    expect(loggedIn(req(null))).toBe(false)
  })

  it('adminOrSelf limita o não-admin ao próprio usuário', () => {
    expect(adminOrSelf(req({ id: 1, role: 'admin' }))).toBe(true)
    expect(adminOrSelf(req({ id: 7, role: 'redator' }))).toEqual({ id: { equals: 7 } })
    expect(adminOrSelf(req(null))).toBe(false)
  })

  it('anônimo só lê produtos fora de rascunho', () => {
    expect(readPublishedProducts(req(null))).toEqual({ status: { not_equals: 'rascunho' } })
    expect(readPublishedProducts(req({ role: 'redator' }))).toBe(true)
  })

  it('redator só edita produtos em rascunho', () => {
    expect(updateProducts(req({ role: 'editor' }))).toBe(true)
    expect(updateProducts(req({ role: 'redator' }))).toEqual({ status: { equals: 'rascunho' } })
    expect(updateProducts(req(null))).toBe(false)
  })
})
