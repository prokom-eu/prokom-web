import adresy from '../../../seed/prokominstalacje/adresy.json'
import wspolne from '../../../seed/prokominstalacje/wspolne.json'
import { OBJECT_KEYS, SERVICE_KEYS } from '../../lib/instalacje/options'
import type { Navigation, ObjectKey, ServiceKey, SheetTab } from '../../sites/instalacje/dane/types'
import { mapHref } from './map'

/**
 * Code data of the Instalacje site from the design package (ADR-I002 §1, §5, decision I2:
 * each page session writes its own `dane/<strona>.ts` from the full prototype source
 * `zrodlo/pages/<Strona>.js` — the snapshots hold only one screen of a widget). Here: the
 * shared cleaning of prototype data and the navigation, written by `write-dane.ts`.
 */

/** Prototype state, not content (ADR-I002 §5). */
const UI_KEYS = new Set(['cls', 'on', 'pick', 'go', 'tch', 'cur', 'exp', 'open'])
const DRAWING = '[svg-path]'
const PROTOTYPE_LINK = /^[\w-]+(\.dc)?\.html(#.*)?$/
const PHOTOS: Record<string, string> = adresy.zdjecia

const isUiKey = (key: string, value: unknown) =>
  UI_KEYS.has(key) ||
  /Cls$/.test(key) ||
  // `--mh:#12B6D8`: a CSS variable of the prototype, the colour lives in the panel.
  (key === 'hs' && typeof value === 'string' && value.startsWith('--'))

function cleanString(value: string): string {
  if (PROTOTYPE_LINK.test(value)) return mapHref(value)
  if (PHOTOS[value]) return PHOTOS[value]
  return value.replace(/^ikona:/, '')
}

/**
 * Prototype data → content: drops UI keys and drawings (`[svg-path]`, geometry stays in the
 * components), maps links (`X.dc.html#…`) and charger photos (`ev/*.webp`) to public addresses,
 * strips the `ikona:` prefix of icon keys.
 */
export function cleanPrototype(value: unknown): unknown {
  if (typeof value === 'string') return cleanString(value)
  if (Array.isArray(value)) {
    return value.filter((item) => item !== DRAWING).map((item) => cleanPrototype(item))
  }
  if (value && typeof value === 'object') {
    const entries = Object.entries(value).filter(
      ([key, item]) => item !== DRAWING && !isUiKey(key, item),
    )
    return Object.fromEntries(entries.map(([key, item]) => [key, cleanPrototype(item)]))
  }
  return value
}

const isServiceKey = (key: string): key is ServiceKey => SERVICE_KEYS.some((k) => k.value === key)
const isObjectKey = (key: string): key is ObjectKey => OBJECT_KEYS.some((k) => k.value === key)

function keysOf<K extends string>(
  items: { k: string }[],
  isKey: (key: string) => key is K,
  what: string,
): K[] {
  return items.map(({ k }) => {
    if (!isKey(k)) throw new Error(`Seed (Instalacje): unknown ${what} key "${k}" in the menu.`)
    return k
  })
}

const SHEETS: Record<string, SheetTab> = {
  Usługi: 'services',
  'Dla kogo': 'objects',
  Więcej: 'more',
}

function sheetOf(label: string): SheetTab {
  const sheet = SHEETS[label]
  if (!sheet) throw new Error(`Seed (Instalacje): no sheet tab for "${label}".`)
  return sheet
}

const icon = (value: string) => (value === DRAWING ? undefined : cleanString(value))

/** Layout of the menus from `wspolne.json` (`megaCols`, `segCols`, `bnav`, `mtabs`, `mmore`). */
export function navigationData(): Navigation {
  const tabLabel = (tab: SheetTab): string => {
    const found = wspolne.mtabs.find((item) => sheetOf(item.n) === tab)
    if (!found) throw new Error(`Seed (Instalacje): no sheet tab "${tab}" in mtabs.`)
    return found.n
  }
  return {
    serviceColumns: wspolne.megaCols.map((column) => ({
      label: column.n,
      keys: keysOf(column.items, isServiceKey, 'service'),
    })),
    objectColumns: wspolne.segCols.map((column) => ({
      label: column.n,
      keys: keysOf(column.items, isObjectKey, 'object'),
    })),
    bottomBar: wspolne.bnav.map((item) => {
      const base = { label: item.n, icon: icon(item.ic), featured: item.cls === 'mid' }
      return item.link ? { ...base, href: mapHref(item.href) } : { ...base, sheet: sheetOf(item.n) }
    }),
    sheetTabs: {
      services: tabLabel('services'),
      objects: tabLabel('objects'),
      more: tabLabel('more'),
    },
    more: wspolne.mmore.map((item) => ({
      label: item.n,
      href: mapHref(item.href),
      icon: icon(item.ic),
      caption: item.s,
    })),
    cta: { label: wspolne.ctaBtn, href: mapHref(wspolne.ctaBtnHref) },
  }
}
