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

/** `tel:` link for a phone number as typed by the editor, e.g. `+48 18 267-70 00`. */
export function toTelHref(phone: string): string | null {
  const trimmed = phone.trim()
  const digits = trimmed.replace(/\D/g, '')
  if (!digits) return null
  return `tel:${trimmed.startsWith('+') ? '+' : ''}${digits}`
}
