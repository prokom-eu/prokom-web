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
}
