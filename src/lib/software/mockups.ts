/**
 * Kinds and variants of the Software mock-ups (ZMIANY-v24 §8, board `v24/boards/Vis.dc.html`):
 * one list for the `Mockup` component and the `Solutions.preview` field (ADR-014 v24 pkt 1).
 */

export const MOCKUP_KINDS = ['site', 'dash', 'flow', 'care', 'before', 'phone'] as const
export type MockupKind = (typeof MOCKUP_KINDS)[number]

export const SITE_VARIANTS = [
  'wizytowka',
  'firmowa',
  'rozbudowana',
  'landing',
  'pensjonat',
  'restauracja',
  'przebudowa',
  'budowlanka',
  'turystyka',
  'uroda',
  'warsztat',
  'sklep',
  'biuro',
  'produkcja',
] as const
export type SiteVariant = (typeof SITE_VARIANTS)[number]

export const DASH_VARIANTS = ['zamowienia', 'crm', 'czas', 'excel', 'pulpit'] as const
export type DashVariant = (typeof DASH_VARIANTS)[number]

export const FLOW_VARIANTS = ['sms', 'faktury', 'raporty', 'ai'] as const
export type FlowVariant = (typeof FLOW_VARIANTS)[number]

const VARIANTS: Record<MockupKind, readonly string[]> = {
  site: SITE_VARIANTS,
  phone: SITE_VARIANTS,
  dash: DASH_VARIANTS,
  flow: FLOW_VARIANTS,
  before: ['przebudowa'],
  care: [],
}

/** Every variant once, for the select in the panel. */
export const MOCKUP_VARIANTS: readonly string[] = [...new Set(Object.values(VARIANTS).flat())]

export function mockupVariants(kind: MockupKind): readonly string[] {
  return VARIANTS[kind]
}

export function isMockupKind(value: unknown): value is MockupKind {
  return typeof value === 'string' && (MOCKUP_KINDS as readonly string[]).includes(value)
}

/** The variant belongs to the kind; `care` has none, so it takes only an empty variant. */
export function isVariantOf(kind: MockupKind, variant: string | null | undefined): boolean {
  const variants = VARIANTS[kind]
  if (variants.length === 0) return !variant
  return !!variant && variants.includes(variant)
}
