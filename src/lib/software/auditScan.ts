/**
 * The demo scan of `/audyt` (ZMIANY-v24 §9.1): „Skanuj podgląd →” in the form starts the sample
 * card next to it. Two separate client islands, so a small channel instead of a shared React tree
 * (the pattern of `lib/shared/menuOpen.ts`). Nothing is sent anywhere — the card only plays its
 * sample; the real result comes in the report.
 */

/** Address shown before anything is typed (the board's sample). */
export const SCAN_HOST_FALLBACK = 'twojafirma.pl'
const MAX_HOST = 40

/** The bare host of a typed address for the card header; anything odd → the sample address. */
export function scanHost(input: string): string {
  const text = input.trim()
  if (!text) return SCAN_HOST_FALLBACK
  try {
    const url = new URL(/^[a-z][a-z0-9+.-]*:/i.test(text) ? text : `https://${text}`)
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return SCAN_HOST_FALLBACK
    const host = url.hostname.toLowerCase().replace(/^www\./, '')
    if (!host.includes('.')) return SCAN_HOST_FALLBACK
    return host.length > MAX_HOST ? `${host.slice(0, MAX_HOST - 1)}…` : host
  } catch {
    return SCAN_HOST_FALLBACK
  }
}

const listeners = new Set<(host: string) => void>()

/** Called by the sample card; returns the unsubscribe. */
export function onAuditScan(listener: (host: string) => void): () => void {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

/** Starts the sample scan for this host. */
export function requestAuditScan(host: string): void {
  for (const listener of listeners) listener(host)
}
