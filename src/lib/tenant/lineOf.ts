import type { PayloadRequest } from 'payload'

import { isLine, type Line } from './lines'

/**
 * Line of a tenant inside a Payload hook or validation (same transaction as `req`). A database
 * error fails the save instead of quietly storing "no line" (B1b review).
 */
export async function lineOfTenant(tenantId: number, req: PayloadRequest): Promise<Line | null> {
  const tenant = await req.payload.findByID({
    collection: 'tenants',
    id: tenantId,
    depth: 0,
    overrideAccess: true,
    req,
  })
  return isLine(tenant.line) ? tenant.line : null
}
