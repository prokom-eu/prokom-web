import { getTenantPostRows } from '../posts/data'
import { postHref } from '../posts/list'
import { type SisterPostRow, type SitePlace, teaser, tenantOrigin } from '../posts/sister'
import { getLineTenantRows, type LineTenantRow, type TenantLine } from './lineContacts'

/** A news card of the hub: a link to a post on its line's own site, never the post itself. */
export type HubNewsLink = {
  title: string
  lead: string | null
  href: string
  publishedAt: string
  line: TenantLine
}

/**
 * Newest posts of the three line sites (spec §6.1 pkt 9, ADR-H001 pkt 7): title, short teaser and
 * the address at the source (the text stays on its domain — SEO). A line without a domain in this
 * environment gives no card; nothing at all = the section is hidden.
 */
export function hubNewsLinks(
  groups: readonly { tenant: LineTenantRow; posts: readonly SisterPostRow[] }[],
  limit: number,
  place: SitePlace,
): HubNewsLink[] {
  const links: HubNewsLink[] = []
  for (const { tenant, posts } of groups) {
    const origin = tenantOrigin(tenant.domains, place)
    if (!origin) continue
    for (const post of posts) {
      const title = post.title?.trim()
      if (!title || !post.slug || !post.publishedAt) continue
      links.push({
        title,
        lead: teaser(post.lead),
        href: `${origin}${postHref(post.slug, tenant.line)}`,
        publishedAt: post.publishedAt,
        line: tenant.line,
      })
    }
  }
  return links.sort((a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt)).slice(0, limit)
}

export async function getHubNews(limit: number, place: SitePlace): Promise<HubNewsLink[]> {
  if (limit <= 0) return []
  const tenants = await getLineTenantRows()
  const groups = await Promise.all(
    tenants.map(async (tenant) => ({ tenant, posts: await getTenantPostRows(tenant.id, limit) })),
  )
  return hubNewsLinks(groups, limit, place)
}
