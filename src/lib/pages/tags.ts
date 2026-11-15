import { tenantIdOf } from '../tenant/id'

/** All cached pages of one tenant (lists, sitemap in S7). */
export const pagesTag = (tenantId: number) => `tenant:${tenantId}:pages`

/** One cached page of one tenant. Tags always carry the tenant (ADR-006). */
export const pageTag = (tenantId: number, slug: string) => `tenant:${tenantId}:page:${slug}`

type PageState = {
  tenant?: unknown
  slug?: string | null
  _status?: 'draft' | 'published' | null
}

function tagsOf(page: PageState | undefined): string[] {
  const tenantId = tenantIdOf(page?.tenant)
  if (tenantId === null || !page?.slug) return []
  return [pagesTag(tenantId), pageTag(tenantId, page.slug)]
}

/**
 * Tags to refresh after a page change: only when the public version may have changed
 * (published now or before), and only for the tenants involved — never the whole site.
 */
export function tagsToRevalidate(doc: PageState, previous: PageState | undefined): string[] {
  const wasPublic = previous?._status === 'published'
  if (doc._status !== 'published' && !wasPublic) return []
  return [...new Set([...tagsOf(doc), ...tagsOf(previous)])]
}
