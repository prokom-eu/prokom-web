/**
 * The one contact field of the shared forms (spec §5 `ContactForm`): „Telefon lub e-mail”. It
 * recognises what was typed — a Polish number (9 digits, with or without +48 / 0048) or an e-mail —
 * so the form sends `phone` or `email` and shows the right message. The server keeps its own,
 * same rules (`lib/inquiry/schema.ts`); this is the browser's quick check (ADR-003).
 */
export type ContactReading =
  | { kind: 'phone'; phone: string }
  | { kind: 'email'; email: string }
  | { kind: 'invalid'; looksLike: 'phone' | 'email' }
  | { kind: 'empty' }

/** Longest number the server accepts (`lib/inquiry/schema.ts`). */
export const PHONE_MAX = 30

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
/** Only digits, spaces, dashes, brackets and a leading „+”: what people type as a number. */
const NUMBERISH = /^\+?[\d\s()-]+$/

export function readContact(value: string): ContactReading {
  const typed = value.trim()
  if (!typed) return { kind: 'empty' }
  if (typed.includes('@')) {
    return EMAIL.test(typed)
      ? { kind: 'email', email: typed }
      : { kind: 'invalid', looksLike: 'email' }
  }
  if (NUMBERISH.test(typed)) {
    // The server keeps up to 30 characters of a number (`schema.ts`).
    if (typed.length > PHONE_MAX) return { kind: 'invalid', looksLike: 'phone' }
    const digits = typed.replace(/\D/g, '').replace(/^(?:0048|48)(?=\d{9}$)/, '')
    return digits.length === 9
      ? { kind: 'phone', phone: typed }
      : { kind: 'invalid', looksLike: 'phone' }
  }
  return { kind: 'invalid', looksLike: 'email' }
}
