import type { CollectionBeforeChangeHook } from 'payload'

import { tenantIdOf } from './id'
import type { Line } from './lines'
import { lineOfTenant } from './lineOf'

/**
 * Copy of the tenant's line for the panel only: `admin.condition` is synchronous and sees just
 * the edited document, so the fields of one line (Biznes, Software) are shown from this copy.
 * Set on every save, whatever the request sends. The public site never trusts it — it uses the
 * tenant's own line.
 */
export const copyTenantLine: CollectionBeforeChangeHook = async ({ data, originalDoc, req }) => {
  const tenantId = tenantIdOf(data.tenant ?? originalDoc?.tenant)
  if (tenantId === null) return data
  return { ...data, line: await lineOfTenant(tenantId, req) }
}

type WithLine = { line?: unknown } | undefined

/** `admin.condition`: fields of `line` only. A new document (no copy yet) shows none of them. */
export const onLine =
  (line: Line) =>
  (data: WithLine): boolean =>
    data?.line === line

/**
 * `admin.condition`: fields every line had before `line` got its own (Biznes fields of a shared
 * collection) — hidden only once the document is known to belong to `line`.
 */
export const notOnLine =
  (line: Line) =>
  (data: WithLine): boolean =>
    data?.line !== line
