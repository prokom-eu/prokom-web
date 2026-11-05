import type { CapsuleNavItem } from '@/components/shared/SiteHeader'
import type { Line } from '@/lib/tenant/lines'

/**
 * Sample menus of the preview page, as on board 11 (NAGLOWEK-KAPSULA §2). The real menus stay in
 * each line's data and come into the capsule with D3; here they only show the layout — the
 * Instalacje one is the longest, the e2e test checks it stays on one row at 1081 and 1180 px.
 * „Kontakt” stands for the current page (pill + `aria-current`).
 */
export const DEMO_NAV: Record<Line, CapsuleNavItem[]> = {
  prokom: [
    { key: 'linie', label: 'Linie' },
    { key: 'o-firmie', label: 'O firmie', href: '/o-firmie' },
    { key: 'kontakt', label: 'Kontakt', href: '/kontakt', current: true },
  ],
  biznes: [
    { key: 'oferta', label: 'Oferta' },
    { key: 'marki', label: 'Marki', href: '/marki' },
    { key: 'opieka-it', label: 'Opieka IT', href: '/opieka-it' },
    { key: 'gopos', label: 'GoPOS', href: '/gopos' },
    { key: 'insert', label: 'InsERT', href: '/insert' },
    { key: 'o-firmie', label: 'O firmie', href: '/o-firmie' },
    { key: 'kontakt', label: 'Kontakt', href: '/kontakt', current: true },
  ],
  instalacje: [
    { key: 'uslugi', label: 'Usługi' },
    { key: 'dla-kogo', label: 'Dla kogo' },
    { key: 'architekci', label: 'Dla architektów', href: '/dla-architektow' },
    { key: 'realizacje', label: 'Realizacje', href: '/realizacje' },
    { key: 'poradnik', label: 'Poradnik', href: '/poradnik' },
    { key: 'o-firmie', label: 'O firmie', href: '/o-firmie' },
    { key: 'kontakt', label: 'Kontakt', href: '/kontakt', current: true },
  ],
  software: [
    { key: 'oferta', label: 'Oferta' },
    { key: 'na-zywo', label: 'Na żywo', href: '/#podglady' },
    { key: 'cennik', label: 'Cennik', href: '/cennik' },
    { key: 'jak-pracujemy', label: 'Jak pracujemy', href: '/#jak-robimy' },
    { key: 'kontakt', label: 'Kontakt', href: '/kontakt', current: true },
  ],
}

/**
 * Short action labels for 1081–1359 px and phones (NAGLOWEK-KAPSULA §2). `shared.headerCta` has
 * no field for it yet. TODO(krystian): field `headerCta.shortLabel` (additive migration) — D3 PR 1.
 */
export const DEMO_SHORT_CTA: Partial<Record<Line, string>> = {
  instalacje: 'Zaplanuj',
  software: 'Wycena',
}

/** Fixed capsule states of the preview (`?stan=`), for screenshots and the e2e test. */
export const PREVIEW_STATES = {
  gora: 'top',
  przewinieta: 'scrolled',
  mega: 'top',
} as const

export type PreviewState = keyof typeof PREVIEW_STATES

export const isPreviewState = (value: unknown): value is PreviewState =>
  typeof value === 'string' && value in PREVIEW_STATES
