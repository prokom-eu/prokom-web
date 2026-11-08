import type { Line } from '../tenant/lines'
import { postHref } from './list'

/** Lines whose newest posts may fill the Biznes home news (plan 0611 §7.1 pkt 12). */
export const SISTER_LINES = ['instalacje', 'software'] as const satisfies readonly Line[]
export type SisterLine = (typeof SISTER_LINES)[number]

/**
 * A link card to another line's post: the title and the address on that line's own site — never
 * its lead, body or cover (the text stays on its domain, SEO rule: no copied text).
 */
export type SisterPostLink = {
  title: string
  /** Absolute, on the line's site in this environment, e.g. `https://prokominstalacje.pl/poradnik/…`. */
  href: string
  publishedAt: string
  line: SisterLine
}

export type SisterDomain = { host?: string | null; environment?: string | null }
export type SisterTenant = {
  id: number
  line: string | null | undefined
  domains?: readonly SisterDomain[] | null
}
/** Where the page is served: the environment (`SITE_ENV`) and, locally, the app's port. */
export type SitePlace = { siteEnv: 'production' | 'staging' | 'local'; port?: string | null }
export type SisterPostRow = { slug: string; title: string; publishedAt?: string | null }

const isSisterLine = (line: unknown): line is SisterLine =>
  SISTER_LINES.includes(line as SisterLine)

/**
 * The tenant's site in this environment, from its domains in the database (decyzja Krystiana
 * 08.11): staging links stay on staging, a line without a domain here gets no link. Locally one
 * app serves every domain, so the port is this app's.
 */
export function tenantOrigin(
  domains: readonly SisterDomain[] | null | undefined,
  place: SitePlace,
): string | null {
  const host = domains?.find((domain) => domain.environment === place.siteEnv)?.host?.trim()
  if (!host) return null
  if (place.siteEnv !== 'local') return `https://${host}`
  return `http://${host}${place.port ? `:${place.port}` : ''}`
}

/** Sister tenants to read: Instalacje and Software only, never the excluded (own) tenant. */
export function sisterTenants<T extends SisterTenant>(
  tenants: readonly T[],
  excludeTenantId: number,
): (T & { line: SisterLine })[] {
  return tenants.filter(
    (tenant): tenant is T & { line: SisterLine } =>
      tenant.id !== excludeTenantId && isSisterLine(tenant.line),
  )
}

/**
 * Newest first, at most `limit`, each reduced to `SisterPostLink` (only the four fields are
 * copied, whatever the rows carry). Rows of the excluded tenant or another line are dropped.
 */
export function sisterPostLinks(
  groups: readonly { tenant: SisterTenant; posts: readonly SisterPostRow[] }[],
  excludeTenantId: number,
  limit: number,
  place: SitePlace,
): SisterPostLink[] {
  if (limit <= 0) return []
  const links: SisterPostLink[] = []
  for (const { tenant, posts } of groups) {
    if (tenant.id === excludeTenantId || !isSisterLine(tenant.line)) continue
    const origin = tenantOrigin(tenant.domains, place)
    if (!origin) continue
    for (const post of posts) {
      const title = post.title?.trim()
      if (!title || !post.slug || !post.publishedAt) continue
      links.push({
        title,
        href: `${origin}${postHref(post.slug, tenant.line)}`,
        publishedAt: post.publishedAt,
        line: tenant.line,
      })
    }
  }
  return links.sort((a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt)).slice(0, limit)
}
