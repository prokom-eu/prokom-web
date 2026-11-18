import { THEME_PARAM, themeParamValue, type ThemeChoice } from '@/lib/brand/theme'

import { LINE_DOMAINS } from './lines'

const LOCAL_HOST = /^[a-z0-9-]+\.localhost$/

/** A host of one of our lines: a domain from `LINE_DOMAINS`, its `www.`/`staging.` host, or a dev host. */
export function isOurHost(host: string): boolean {
  if (LOCAL_HOST.test(host)) return true
  const bare = host.replace(/^(www|staging)\./, '')
  return (LINE_DOMAINS as readonly string[]).includes(bare)
}

/**
 * `href` with `motyw=` for the visitor's choice (spec §3.2), or `null` when the link stays as it is:
 * not http(s), not one of our hosts, or the same host (same storage — and a client-side navigation
 * must not carry the parameter). Query and fragment are kept.
 */
export function withThemeParam(href: string, choice: ThemeChoice, here: string): string | null {
  let url: URL
  try {
    url = new URL(href, here)
  } catch {
    return null
  }
  if (url.protocol !== 'https:' && url.protocol !== 'http:') return null
  if (url.host === new URL(here).host || !isOurHost(url.hostname)) return null
  url.searchParams.set(THEME_PARAM, themeParamValue(choice))
  return url.href
}

/**
 * The address without `motyw` as path + query + fragment for `history.replaceState`, or `null`
 * when there is no parameter (spec §3.3: an unknown value goes too).
 */
export function cleanThemeParam(href: string): string | null {
  const url = new URL(href)
  if (!url.searchParams.has(THEME_PARAM)) return null
  url.searchParams.delete(THEME_PARAM)
  return `${url.pathname}${url.search}${url.hash}`
}
