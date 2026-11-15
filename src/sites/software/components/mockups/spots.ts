import {
  isVariantOf,
  type MockupKind,
  SITE_VARIANTS,
  type SiteVariant,
} from '@/lib/software/mockups'
import { type SpotKey, spotsOf } from '@/lib/software/spots'

import { SITES } from './data'

/**
 * Areas a mock-up can light up (OKNO-OFERTY-PREMIUM §2.2), read from the same sample texts the
 * parts are drawn from (`data-spot` in `Site.tsx`): the call button, the menu, the widget (its
 * rows and chips), the features. A
 * page with a phone version also has `mobile` (the „Telefon” view of the gallery). A system
 * panel has its own three parts (`data-spot` in `Panels.tsx`).
 */
export function mockupSpots(kind: MockupKind | null, variant: string | null): Set<SpotKey> {
  const spots = new Set<SpotKey>()
  // A system panel (`MockDash`): the active module, the user accounts, the phone badge; the
  // company dashboard also its KPIs, chart, „Wymaga uwagi” and report (SWA14 §4.4).
  if (kind === 'dash') {
    const panel: SpotKey[] = ['modul', 'uzytkownicy', 'mobile']
    if (variant === 'pulpit') panel.push('kpi', 'wykres', 'uwaga', 'raport')
    return new Set<SpotKey>(panel)
  }
  if (kind !== 'site' && kind !== 'phone') return spots
  const name = (isVariantOf(kind, variant) ? variant : SITE_VARIANTS[0]) as SiteVariant
  const site = SITES[name]
  const texts = [
    site.cta,
    // The second button of the hero and of the phone screen (`Site.tsx`).
    'Zadzwoń',
    `${site.widget.title} ${site.widget.button}`,
    ...(kind === 'site'
      ? [
          // The phone screen draws no rows of the widget.
          ...site.widget.rows.map((row) => `${row.label} ${row.value}`),
          ...site.nav,
          ...site.widget.chips.map(([label]) => label),
          ...site.features.map(([, title, note]) => `${title} ${note}`),
        ]
      : []),
  ]
  for (const text of texts) for (const spot of spotsOf(text)) spots.add(spot)
  if (kind === 'site' && isVariantOf('phone', name)) spots.add('mobile')
  if (kind === 'phone') spots.add('mobile')
  return spots
}
