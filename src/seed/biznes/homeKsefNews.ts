import type { Payload } from 'payload'

import { HOME_SLUG } from '../../lib/pages/slug'
import type { SiteSetting } from '../../payload-types'
import type { PageBlock } from './page'

// BIZ-2 B3-2 (plan 0611 §7.1 pkt 7 and 12): the KSeF band and „Aktualności” on a home page the
// seed created earlier, and the band's deadline and texts in `SiteSettings → Biznes → KSeF`.
// A missing block is inserted at its place of §7.1 (a block removed in the panel comes back on
// the next run — accepted, the seed runs locally only); a stored one is left as it is. A settings
// field is filled only while empty (the panel wins).

type Block = { blockType: string; variant?: unknown }
type Report = (name: string, changed: boolean) => void

/**
 * The KSeF deadline for all businesses, the smallest included: 1 January 2027 — confirmed in
 * official sources (ksef.podatki.gov.pl „JDG i MŚP”; gov.pl IAS Wrocław „KSeF — III etap
 * wdrożenia od 1 stycznia 2027 r.”). Penalties for KSeF errors are postponed by a government bill
 * (MF) — the band's texts name the obligation only, never a penalty date.
 */
export const KSEF_DEADLINE_SEED = '2027-01-01T00:00:00.000Z'

/** Band texts in the panel: the obligation only, no legal claims beyond the deadline. */
export const KSEF_BAND_SETTINGS = {
  deadline: KSEF_DEADLINE_SEED,
  href: '/ksef',
  textBefore: 'Od 1 stycznia 2027 KSeF obowiązuje wszystkie firmy, także najmniejsze.',
  textAfter: 'KSeF obowiązuje wszystkie firmy — pomożemy we wdrożeniu.',
} as const

/** The six steps of `/ksef` („6 kroków do gotowości na KSeF”), titles only. */
export const KSEF_BAND_STEPS = [
  'Sprawdź program do faktur',
  'Dostęp i uprawnienia',
  'Certyfikat KSeF',
  'Faktury z kasy fiskalnej',
  'Procedura na awarię',
  'Test i szkolenie',
] as const

export const KSEF_BAND_BLOCK = {
  blockType: 'bzKsef',
  variant: 'band',
  eyebrow: 'KSeF · obowiązek dla każdej firmy',
  text: 'Przygotujemy Twoją firmę: sprawdzimy program do faktur, uprawnienia i kasę, przygotujemy certyfikat do trybu offline i procedurę na wypadek awarii.',
  link: { label: 'Przygotuj firmę do KSeF', href: '/ksef' },
  checklist: KSEF_BAND_STEPS.map((title) => ({ title })),
} as const

export const NEWS_HOME_BLOCK = {
  blockType: 'bzNewsHome',
  eyebrow: 'Aktualności i poradniki',
  heading: 'Piszemy o tym, co zmienia się w Twojej firmie',
  lead: 'Przepisy, terminy i praktyczne porady — od KSeF po monitoring i strony internetowe. Wpisy z całej firmy PRO-KOM.',
  allLabel: 'Wszystkie aktualności',
} as const

const isBand = (block: Block) => block.blockType === 'bzKsef' && block.variant === 'band'

function insertAt<T extends Block>(layout: readonly T[], block: T, before: string[]): T[] {
  const index = before
    .map((type) => layout.findIndex((item) => item.blockType === type))
    .find((found) => found >= 0)
  const at = index ?? layout.length
  return [...layout.slice(0, at), block, ...layout.slice(at)]
}

/**
 * The home layout with the KSeF band (after „Najczęściej wybierane”, before the plan) and
 * „Aktualności” (before the FAQ), or `null` when both are there.
 */
export function upgradeHomeKsefNews<T extends Block>(
  layout: readonly T[] | null | undefined,
  blocks: { band: T; news: T },
): T[] | null {
  if (!layout || layout.length === 0) return null
  let next: T[] = [...layout]
  let changed = false
  if (!next.some(isBand)) {
    const featured = next.findIndex((item) => item.blockType === 'bzFeatured')
    next =
      featured >= 0
        ? [...next.slice(0, featured + 1), blocks.band, ...next.slice(featured + 1)]
        : insertAt(next, blocks.band, ['bzPlan', 'bzSteps', 'faq', 'bzContact'])
    changed = true
  }
  if (!next.some((item) => item.blockType === 'bzNewsHome')) {
    next = insertAt(next, blocks.news, ['faq', 'bzContact'])
    changed = true
  }
  return changed ? next : null
}

type KsefGroup = NonNullable<NonNullable<SiteSetting['biznes']>['ksef']>

/** `SiteSettings.biznes.ksef` with its empty fields filled, or `null` when nothing is empty. */
export function ksefBandSettingsUpdate(stored: KsefGroup | null | undefined): KsefGroup | null {
  const blank = (value: unknown) => typeof value !== 'string' || value.trim() === ''
  const filled: KsefGroup = { ...stored }
  let changed = false
  for (const key of ['deadline', 'href', 'textBefore', 'textAfter'] as const) {
    if (blank(stored?.[key])) {
      filled[key] = KSEF_BAND_SETTINGS[key]
      changed = true
    }
  }
  return changed ? filled : null
}

const local = { overrideAccess: true, context: { seed: true }, depth: 0 } as const

/** B3-2 on the stored home page and the Biznes settings (after B3-1's order). */
export async function seedBiznesHomeKsefNews(
  payload: Payload,
  tenantId: number,
  report: Report,
): Promise<void> {
  const {
    docs: [settings],
  } = await payload.find({
    collection: 'site-settings',
    where: { tenant: { equals: tenantId } },
    limit: 1,
    ...local,
  })
  if (settings) {
    const ksef = ksefBandSettingsUpdate(settings.biznes?.ksef)
    report('site-settings KSeF band', ksef !== null)
    if (ksef) {
      await payload.update({
        collection: 'site-settings',
        id: settings.id,
        data: { biznes: { ...settings.biznes, ksef } },
        ...local,
      })
    }
  }

  const {
    docs: [home],
  } = await payload.find({
    collection: 'pages',
    where: { and: [{ tenant: { equals: tenantId } }, { slug: { equals: HOME_SLUG } }] },
    limit: 1,
    ...local,
  })
  if (!home) return
  const layout = upgradeHomeKsefNews<PageBlock>(home.layout, {
    band: { ...KSEF_BAND_BLOCK, checklist: [...KSEF_BAND_BLOCK.checklist] } as PageBlock,
    news: { ...NEWS_HOME_BLOCK } as PageBlock,
  })
  report('pages home (B3-2)', layout !== null)
  if (!layout) return
  await payload.update({
    collection: 'pages',
    id: home.id,
    data: { layout, _status: home._status ?? 'published' },
    ...local,
  })
}
