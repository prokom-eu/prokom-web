const ENTITIES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
}

/**
 * Escapes a value for HTML text and quoted attributes (spec MAILE §6 pkt 2). Every value that
 * goes into a mail template passes here — form data, panel data and our own texts alike.
 */
export function esc(value: string | number | null | undefined): string {
  return String(value ?? '').replace(/[&<>"']/g, (char) => ENTITIES[char] ?? char)
}

/** Escaped text with line breaks kept (`<br>`), e.g. the customer's message. */
export function escLines(value: string): string {
  return esc(value).replace(/\r?\n/g, '<br>')
}
