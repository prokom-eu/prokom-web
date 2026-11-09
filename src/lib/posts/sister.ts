import type { Line } from '../tenant/lines'
import { postHref } from './list'

/** Lines whose newest posts may fill the Biznes home news (plan 0611 §7.1 pkt 12). */
export const SISTER_LINES = ['instalacje', 'software'] as const satisfies readonly Line[]
export type SisterLine = (typeof SISTER_LINES)[number]

/** At most this many characters of the other line's lead (NAPRAWA-0911 §4). */
export const SISTER_LEAD_MAX = 140

/**
 * A link card to another line's post: the title, a short teaser of its lead and the address on
 * that line's own site — never its body or cover (the text stays on its domain: a teaser of
 * ≤ 140 characters with a link to the source, not a copy; NAPRAWA-0911 §4).
 */
export type SisterPostLink = {
  title: string
  /** The lead cut to `SISTER_LEAD_MAX` at a word, with „…”; `null` when the post has none. */
  lead: string | null
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
export type SisterPostRow = {
  slug: string
  title: string
  publishedAt?: string | null
  lead?: string | null
}

/** A lead cut at a word to `max` characters, with „…” when cut. */
export function teaser(text: string | null | undefined, max = SISTER_LEAD_MAX): string | null {
  const clean = text?.replace(/\s+/g, ' ').trim()
  if (!clean) return null
  if (clean.length <= max) return clean
  const cut = clean.slice(0, max - 1)
  const word = cut.lastIndexOf(' ')
  return `${(word > max * 0.6 ? cut.slice(0, word) : cut).replace(/[\s,.;:–—-]+$/, '')}…`
}

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
 * Newest first, at most `limit`, each reduced to `SisterPostLink` (only its five fields — the
 * lead as a short teaser — whatever the rows carry). Rows of the excluded tenant or another line are dropped.
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
        lead: teaser(post.lead),
        href: `${origin}${postHref(post.slug, tenant.line)}`,
        publishedAt: post.publishedAt,
        line: tenant.line,
      })
    }
  }
  return links.sort((a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt)).slice(0, limit)
}
