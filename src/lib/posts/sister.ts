import { BRAND_LINKS } from '../brand/lines'
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
  /** Absolute, on the line's public site, e.g. `https://prokominstalacje.pl/poradnik/…`. */
  href: string
  publishedAt: string
  line: SisterLine
}

export type SisterTenant = { id: number; line: string | null | undefined }
export type SisterPostRow = { slug: string; title: string; publishedAt?: string | null }

const isSisterLine = (line: unknown): line is SisterLine =>
  SISTER_LINES.includes(line as SisterLine)

/** The public site of a line (`BRAND_LINKS`, production addresses — docs/dns.md). */
export function lineOrigin(line: SisterLine): string | null {
  return BRAND_LINKS.find((link) => link.line === line)?.href ?? null
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
): SisterPostLink[] {
  if (limit <= 0) return []
  const links: SisterPostLink[] = []
  for (const { tenant, posts } of groups) {
    if (tenant.id === excludeTenantId || !isSisterLine(tenant.line)) continue
    const origin = lineOrigin(tenant.line)
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
