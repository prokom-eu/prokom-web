import type { Access, FieldAccess, Where } from 'payload'

export const ROLES = ['admin', 'editor'] as const
export type Role = (typeof ROLES)[number]

type UserLike = { id: number | string; role?: Role | null } | null | undefined

export function isAdmin(user: UserLike): boolean {
  return user?.role === 'admin'
}

/** Admins see every user; any other logged-in user only themselves. */
export function adminOrSelfWhere(user: UserLike): boolean | Where {
  if (!user) return false
  if (isAdmin(user)) return true
  return { id: { equals: user.id } }
}

export const adminOnly: Access = ({ req: { user } }) => isAdmin(user)

export const adminOrSelf: Access = ({ req: { user } }) => adminOrSelfWhere(user)

export const adminOnlyField: FieldAccess = ({ req: { user } }) => isAdmin(user)
