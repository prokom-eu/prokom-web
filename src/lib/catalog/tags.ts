import { tenantIdOf } from '../tenant/id'

/** The cached catalog index of one tenant. Tags always carry the tenant (ADR-006). */
export const catalogTag = (tenantId: number) => `tenant:${tenantId}:catalog`

/** A changed catalog document: tenant-scoped (`tenant`) or a shared brand (`tenants`). */
export type CatalogDocState = {
  tenant?: unknown
  tenants?: unknown[] | null
  /** Only collections with drafts (products) have it. */
  _status?: 'draft' | 'published' | null
}

function tenantsOf(doc: CatalogDocState | undefined): number[] {
  if (!doc) return []
  const ids = [doc.tenant, ...(doc.tenants ?? [])].map(tenantIdOf)
  return ids.filter((id): id is number => id !== null)
}

/**
 * Tenants whose public index a change touches: the tenants before and after, and for a document
 * with drafts only when its public version may have changed — saving a draft changes nothing on
 * the site. Shared by the indexes of every line (`lib/software/tags.ts`).
 */
export function tenantsToRevalidate(
  doc: CatalogDocState,
  previous: CatalogDocState | undefined,
): number[] {
  const hasDrafts = doc._status !== undefined || previous?._status !== undefined
  if (hasDrafts && doc._status !== 'published' && previous?._status !== 'published') return []
  return [...new Set([...tenantsOf(doc), ...tenantsOf(previous)])]
}

/**
 * Index tags to refresh after a change of a product, category, group, industry, brand or the
 * search settings (`tenantsToRevalidate`).
 */
export function catalogTagsToRevalidate(
  doc: CatalogDocState,
  previous: CatalogDocState | undefined,
): string[] {
  return tenantsToRevalidate(doc, previous).map(catalogTag)
}
