import type { Partner } from '../../payload-types'
import { tenantIdOf } from '../tenant/id'

/**
 * A partner from a relationship field, when it is shown on this site. `Partners` is shared
 * between lines; the panel filters them, the page checks again when rendered.
 */
export function shownPartner(value: unknown, tenantId: number): Partner | null {
  if (!value || typeof value !== 'object') return null
  const partner = value as Partner
  const shown = (partner.tenants ?? []).some((tenant) => tenantIdOf(tenant) === tenantId)
  return shown ? partner : null
}
