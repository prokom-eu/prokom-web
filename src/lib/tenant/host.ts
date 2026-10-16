// Labels of letters, digits and hyphens; or a bracketed IPv6 address.
const HOSTNAME = /^(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?)(?:\.[a-z0-9](?:[a-z0-9-]*[a-z0-9])?)*$/
const IPV6 = /^\[[0-9a-f:.]+\]$/

/**
 * Canonical form of a `Host` header or a domain typed in the panel: lowercase, no port,
 * no trailing dot. Returns `null` for anything that is not a plain hostname.
 */
export function normalizeHost(raw: string | null | undefined): string | null {
  const value = raw?.trim().toLowerCase()
  if (!value) return null

  const host = value.startsWith('[')
    ? value.slice(0, value.indexOf(']') + 1)
    : value.replace(/:\d+$/, '').replace(/\.$/, '')

  if (IPV6.test(host) || HOSTNAME.test(host)) return host
  return null
}

/** Hosts that appear more than once (after normalization), in order of first repeat. */
export function findDuplicateHosts(hosts: readonly string[]): string[] {
  const seen = new Set<string>()
  const duplicates = new Set<string>()
  for (const raw of hosts) {
    const host = normalizeHost(raw) ?? raw
    if (seen.has(host)) duplicates.add(host)
    seen.add(host)
  }
  return [...duplicates]
}
