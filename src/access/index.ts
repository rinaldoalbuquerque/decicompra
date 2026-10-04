import type { Access, FieldAccess } from 'payload'

export type Role = 'admin' | 'editor' | 'redator'

export const ROLES: Role[] = ['admin', 'editor', 'redator']

export function roleOf(user: unknown): Role | null {
  const role = (user as { role?: unknown } | null | undefined)?.role
  return ROLES.includes(role as Role) ? (role as Role) : null
}

// O primeiro usuário do sistema é sempre administrador
export function roleForNewUser(requested: Role | null | undefined, existingUsers: number): Role {
  if (existingUsers === 0) return 'admin'
  return requested ?? 'redator'
}

export const anyone: Access = () => true

export const loggedIn: Access = ({ req }) => Boolean(req.user)

export const adminOnly: Access = ({ req }) => roleOf(req.user) === 'admin'

export const adminOrEditor: Access = ({ req }) => {
  const role = roleOf(req.user)
  return role === 'admin' || role === 'editor'
}

export const adminOrSelf: Access = ({ req }) => {
  if (roleOf(req.user) === 'admin') return true
  return req.user ? { id: { equals: req.user.id } } : false
}

export const readPublishedProducts: Access = ({ req }) =>
  req.user ? true : { status: { not_equals: 'rascunho' } }

export const updateProducts: Access = ({ req }) => {
  const role = roleOf(req.user)
  if (role === 'admin' || role === 'editor') return true
  if (role === 'redator') return { status: { equals: 'rascunho' } }
  return false
}

export const adminFieldAccess: FieldAccess = ({ req }) => roleOf(req.user) === 'admin'

export const loggedInField: FieldAccess = ({ req }) => Boolean(req.user)

// Variantes e ofertas de produtos em rascunho não aparecem para visitantes
export const readOfPublishedProducts: Access = ({ req }) =>
  req.user ? true : { 'product.status': { not_equals: 'rascunho' } }

// Redator só altera variantes de produtos em rascunho
export const updateVariants: Access = ({ req }) => {
  const role = roleOf(req.user)
  if (role === 'admin' || role === 'editor') return true
  if (role === 'redator') return { 'product.status': { equals: 'rascunho' } }
  return false
}
