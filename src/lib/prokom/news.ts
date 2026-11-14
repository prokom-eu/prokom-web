import { getLineTenantRows, getTenantPostRows } from '../posts/data'
import { linePostLinks, type SisterPostLink, type SitePlace } from '../posts/sister'
import { TENANT_LINES, type TenantLine } from './lineContacts'

/** A news card of the hub: a link to a post on its line's own site, never the post itself. */
export type HubNewsLink = SisterPostLink<TenantLine>

/**
 * Newest posts of the three line sites (spec §6.1 pkt 9, ADR-H001 pkt 7): title, short teaser and
 * the address at the source (the text stays on its domain — SEO), via the shared `linePostLinks`.
 * A line without a domain in this environment gives no card; nothing at all = the section is hidden.
 */
export async function getHubNews(limit: number, place: SitePlace): Promise<HubNewsLink[]> {
  if (limit <= 0) return []
  const tenants = await getLineTenantRows(TENANT_LINES)
  const groups = await Promise.all(
    tenants.map(async (tenant) => ({ tenant, posts: await getTenantPostRows(tenant.id, limit) })),
  )
  return linePostLinks(groups, TENANT_LINES, limit, place)
}
