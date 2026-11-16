import type { SisterPostRow, SisterTenant } from '../posts/sister'
import type { TenantLine } from './lineContacts'

/** The hub order of the three line sites (`TENANT_LINES`, kept here: that module reads the database). */
const ORDER: readonly TenantLine[] = ['biznes', 'instalacje', 'software']

/**
 * The post of each line the hub shows (Krystian 16.11: Biznes, Instalacje and Software, one of
 * each, the best fit for the company's start page — not just the newest, which were all Biznes).
 * A slug that is gone or not public falls back to the line's newest post, so a card never dies.
 */
export const HUB_NEWS_PICKS: Partial<Record<TenantLine, string>> = {
  biznes: 'ksef-od-1-stycznia-2027',
  instalacje: 'wifi-w-pensjonacie',
  software: 'ile-kosztuje-strona-internetowa-dla-firmy',
}

/** How many newest posts of a line are looked through for its chosen one. */
export const LOOKUP = 60

type Group = { tenant: SisterTenant; posts: readonly SisterPostRow[] }

/**
 * One post per line in the hub order (Biznes, Instalacje, Software): the chosen slug of the line
 * when it is among its public posts, otherwise its newest; a line without posts is left out.
 */
export function chooseLinePosts(
  groups: readonly Group[],
  picks: Partial<Record<string, string>>,
): Group[] {
  return ORDER.flatMap((line) => {
    const group = groups.find((entry) => entry.tenant.line === line)
    if (!group || group.posts.length === 0) return []
    const chosen = group.posts.find((post) => post.slug === picks[line]) ?? group.posts[0]
    return chosen ? [{ tenant: group.tenant, posts: [chosen] }] : []
  })
}
