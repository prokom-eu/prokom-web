import { getUserTenantIDs } from '@payloadcms/plugin-multi-tenant/utilities'
import type { Access } from 'payload'

import { isAdmin } from './access'

/**
 * `partners` is outside the multi-tenant plugin (one brand is shown on several sites), so the
 * plugin does not limit editors there (audit AB4, W-02). An editor updates only partners shown on
 * one of his sites; creating partners and choosing their sites is for an admin.
 */
export const partnerUpdateAccess: Access = ({ req: { user } }) => {
  if (!user) return false
  if (isAdmin(user)) return true
  const ids = getUserTenantIDs(user as Parameters<typeof getUserTenantIDs>[0])
  return ids.length ? { tenants: { in: ids } } : false
}
