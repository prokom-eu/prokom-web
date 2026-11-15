/**
 * Categories of hub inquiries (ADR-H002 §3, contract ADR-003: `Inquiries.category` is free text,
 * so the list lives here — one place for the forms of H4–H6 and their mail routing).
 */
export const HUB_INQUIRY_CATEGORIES = [
  'hub-kontakt',
  'hub-dla-firm',
  'hub-dla-domu',
  'hub-pomoc',
  'hub-dostawy',
  'hub-wspolpraca',
] as const

export type HubInquiryCategory = (typeof HUB_INQUIRY_CATEGORIES)[number]

export function isHubInquiryCategory(value: unknown): value is HubInquiryCategory {
  return typeof value === 'string' && (HUB_INQUIRY_CATEGORIES as readonly string[]).includes(value)
}
