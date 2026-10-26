import { tenantsToRevalidate, type CatalogDocState } from '../catalog/tags'

/** The cached solutions index of one tenant (ADR-014 §4). Tags always carry the tenant (ADR-006). */
export const solutionsTag = (tenantId: number) => `tenant:${tenantId}:solutions`

/**
 * Index tags to refresh after a change of a solution or the Software settings: the tenants
 * before and after, and for a solution only when its public version may have changed.
 */
export function solutionsTagsToRevalidate(
  doc: CatalogDocState,
  previous: CatalogDocState | undefined,
): string[] {
  return tenantsToRevalidate(doc, previous).map(solutionsTag)
}
