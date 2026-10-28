import type { OBJECT_KEYS, SERVICE_KEYS } from '../../../lib/instalacje/options'

/**
 * Shapes of the code data files of the Instalacje site (`dane/*.ts`, ADR-I002 §1). Each file is
 * generated once from the design package and edited by hand afterwards.
 */

export type ServiceKey = (typeof SERVICE_KEYS)[number]['value']
export type ObjectKey = (typeof OBJECT_KEYS)[number]['value']

/** A tab of the phone menu sheet (MOBILE-APLIKACJA). */
export type SheetTab = 'services' | 'objects' | 'more'

export type NavLink = {
  label: string
  href: string
  /** Icon key of the design (`zrodlo/common.js → icons()`). */
  icon?: string
  caption?: string
  /** Shown in the accent colour (the „Dla architektów” item, ADR-I005 §4). */
  accent?: boolean
}

/** Promo column of a mega menu panel (`zrodlo/header.html` → `.megap`). */
export type MegaPromo = {
  eyebrow: string
  /** Without it the title is the offer count („10 obszarów, 76 rozwiązań”). */
  title?: string
  text: string
  button: { label: string; href: string }
  link: { label: string; href: string }
}

/**
 * Layout of the menus. Names, captions, icons and colours of services and objects come from
 * the panel (`InstServices`, `InstObjects`) by key, so a rename there shows in every menu.
 */
export type Navigation = {
  /** Mega menu „Usługi” and the „Usługi” sheet tab: columns in order, keys in order. */
  serviceColumns: { label: string; keys: ServiceKey[] }[]
  /** Mega menu „Dla kogo” and the „Dla kogo” sheet tab. */
  objectColumns: { label: string; keys: ObjectKey[] }[]
  /** Phone bottom bar, left to right: a link, or a button that opens a sheet tab. */
  bottomBar: ({ label: string; icon?: string; featured: boolean } & (
    { href: string } | { sheet: SheetTab }
  ))[]
  /** Labels of the sheet tabs. */
  sheetTabs: Record<SheetTab, string>
  /** „Więcej”: the remaining pages. */
  more: NavLink[]
  /** Main call to action of the header. */
  cta: { label: string; href: string }
  /** Desktop top bar: other PRO-KOM sites and „Zgłoś awarię” (spec §4). */
  topBar: { links: NavLink[]; fault: NavLink }
  /** Desktop header links after „Usługi ▾” and „Dla kogo ▾”, in order. */
  header: NavLink[]
  /** Promo columns of the two mega menu panels. */
  megaServices: MegaPromo
  megaObjects: MegaPromo
  /** Band above the footer (`zrodlo/footer.html` → `.cta`); hidden on the start page. */
  ctaBand: { eyebrow: string; title: string; text: string; button: { label: string; href: string } }
  /** Footer (`zrodlo/footer.html`). Contact, salons and hours come from the panel. */
  footer: {
    about: string
    chips: { label: string; strong?: boolean }[]
    plan: { label: string; title: string; caption: string; href: string }
    company: NavLink[]
    sites: NavLink[]
  }
}

/** The part of `Navigation` generated from the seed (`src/seed/instalacje/dane.ts`, I2). */
export type SeedNavigation = Pick<
  Navigation,
  'serviceColumns' | 'objectColumns' | 'bottomBar' | 'sheetTabs' | 'more' | 'cta'
>
