/** First two digits of Polish mobile numbers (UKE numbering plan); others are landlines. */
const MOBILE_PREFIX = /^(?:45|5[0137]|6[069]|7[2389]|88)/

/**
 * One way of showing a Polish number on the hub (audit H8 pkt 5): with or without `+48`, spaced
 * or not — a mobile reads in three groups of three digits, a landline as area code + 3-2-2, no
 * prefix. Anything else (a foreign or short number) stays as typed. `toTelHref` gives the same
 * `tel:` link for the shown and the typed form.
 */
export function hubPhone(phone: string | null): string | null {
  if (!phone) return null
  const digits = phone.replace(/\D/g, '').replace(/^(?:0048|48)(?=\d{9}$)/, '')
  if (digits.length !== 9) return phone.trim()
  return MOBILE_PREFIX.test(digits)
    ? digits.replace(/(\d{3})(\d{3})(\d{3})/, '$1 $2 $3')
    : digits.replace(/(\d{2})(\d{3})(\d{2})(\d{2})/, '$1 $2 $3 $4')
}
