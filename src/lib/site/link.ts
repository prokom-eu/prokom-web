/**
 * Links an editor may put in navigation and footer: site paths, https URLs (other lines,
 * the hub), `mailto:` and `tel:`. Anything else (`javascript:`, protocol-relative `//`,
 * plain http) is rejected. Backslashes are rejected too: browsers read `/\host` as `//host`.
 */
export function isValidNavHref(href: string): boolean {
  if (/[\s\\]/.test(href)) return false
  if (href.startsWith('/')) return !href.startsWith('//')
  if (/^(mailto|tel):.+/.test(href)) return true
  if (!href.startsWith('https://')) return false
  try {
    return new URL(href).hostname !== ''
  } catch {
    return false
  }
}

/** An external `https://` address only (sources, partner sites opened in a new tab). */
export function isHttpsUrl(href: string): boolean {
  return href.startsWith('https://') && isValidNavHref(href)
}

/**
 * `tel:` link for a phone number as typed by the editor, e.g. `+48 18 267-70 00`. A bare 9-digit
 * number (`883 200 151`, as the boards print it) is Polish, so it gets `+48`.
 */
export function toTelHref(phone: string): string | null {
  const trimmed = phone.trim()
  const digits = trimmed.replace(/\D/g, '')
  if (!digits) return null
  if (trimmed.startsWith('+')) return `tel:+${digits}`
  return `tel:${digits.length === 9 ? '+48' : ''}${digits}`
}

/** The address in Google Maps — a link, not an embedded map (no third party before consent). */
export function toMapsHref(address: string): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`
}

/** Route to the address in Google Maps. */
export function toDirectionsHref(address: string): string {
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address)}`
}
