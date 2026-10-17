import { isValidNavHref } from '../site/link'

/**
 * Canonical form of a redirect source and of a request path: decoded (`%C5%BC` = `ż`),
 * without a trailing slash. Only a plain path — no query, fragment, scheme or `//` (an editor
 * pasting a full address gets a validation error instead of a rule that never matches).
 */
export function normalizeRedirectPath(value: string): string | null {
  const trimmed = value.trim()
  if (!trimmed.startsWith('/') || trimmed.startsWith('//') || /[\s\\?#]/.test(trimmed)) {
    return null
  }
  let decoded: string
  try {
    decoded = decodeURIComponent(trimmed)
  } catch {
    return null
  }
  return withoutTrailingSlash(decoded)
}

const withoutTrailingSlash = (path: string) => (path.length > 1 ? path.replace(/\/+$/, '') : path)

/** Target of a redirect: a path of this site or an https address (not mailto:/tel:). */
export function isValidRedirectTarget(value: string): boolean {
  return (value.startsWith('/') || value.startsWith('https://')) && isValidNavHref(value)
}

export type RedirectRule = { from: string; to: string }

/**
 * Rules of one tenant by source. Sources are stored already normalized (decoded), so they are
 * not decoded again — a literal `%` would break that. Invalid rows (edited outside the panel)
 * are skipped.
 */
export function buildRedirectMap(rules: readonly RedirectRule[]): Map<string, string> {
  const map = new Map<string, string>()
  for (const { from, to } of rules) {
    const key = withoutTrailingSlash(from.trim())
    if (key.startsWith('/') && !key.startsWith('//') && isValidRedirectTarget(to)) {
      map.set(key, to)
    }
  }
  return map
}

/** Target for a request path, or `null`. */
export function matchRedirect(pathname: string, map: ReadonlyMap<string, string>): string | null {
  const key = normalizeRedirectPath(pathname)
  return (key && map.get(key)) ?? null
}
