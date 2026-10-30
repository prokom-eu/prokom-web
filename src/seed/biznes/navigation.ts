import type { SiteSetting } from '@/payload-types'

type Navigation = NonNullable<NonNullable<SiteSetting['biznes']>['navigation']>

type Refs = {
  /** Seed slug of a group (`sprz`, `prog`…) → id. */
  group: (slug: string) => number | undefined
  /** Brand name (`GoPOS`) → partner id. */
  partner: (name: string) => number | undefined
  /** File name of the design package → media id. */
  image: (file: string) => number | undefined
}

function ref(lookup: (key: string) => number | undefined, key: string, kind: string): number {
  const id = lookup(key)
  if (id === undefined) throw new Error(`Seed (Biznes): navigation needs ${kind} "${key}".`)
  return id
}

type MenuItem = NonNullable<Navigation['menu']>[number]

/** Menu of the first seed (v20): an untouched one gets „Gotowe zestawy” (K3c). */
const LEGACY_MENU: Pick<MenuItem, 'type' | 'label' | 'href'>[] = [
  { type: 'offer', label: 'Oferta', href: '/oferta' },
  { type: 'link', label: 'Opieka IT', href: '/opieka-it' },
  { type: 'link', label: 'GoPOS', href: '/gopos' },
  { type: 'link', label: 'InsERT', href: '/insert' },
  { type: 'link', label: 'O firmie', href: '/o-firmie' },
  { type: 'link', label: 'Kontakt', href: '/kontakt' },
]

/** Header menu (`k31/screens/Web-*-1440`): Oferta, Gotowe zestawy, Opieka IT, GoPOS, InsERT… */
export function menuData(): MenuItem[] {
  return [
    { type: 'offer', label: 'Oferta', href: '/oferta' },
    { type: 'link', label: 'Gotowe zestawy', href: '/zestawy' },
    { type: 'link', label: 'Opieka IT', href: '/opieka-it' },
    { type: 'link', label: 'GoPOS', href: '/gopos', partner: true },
    { type: 'link', label: 'InsERT', href: '/insert', partner: true },
    { type: 'link', label: 'O firmie', href: '/o-firmie' },
    { type: 'link', label: 'Kontakt', href: '/kontakt' },
  ]
}

/**
 * The new menu for one still as the first seed wrote it (types, labels, addresses); `null` when
 * anything was edited in the panel (the panel wins) or it is already current.
 */
export function upgradedMenu(current: readonly MenuItem[] | null | undefined): MenuItem[] | null {
  const untouched =
    current?.length === LEGACY_MENU.length &&
    current.every(
      (item, i) =>
        item.type === LEGACY_MENU[i]!.type &&
        item.label === LEGACY_MENU[i]!.label &&
        item.href === LEGACY_MENU[i]!.href,
    )
  return untouched ? menuData() : null
}

/** Categories per mega menu column: the K4 menu (v147c) shows every category of a department. */
export const K4_COLUMN_LIMIT = 10
/** What the seed wrote before K4a-1b-2. */
const LEGACY_COLUMN_LIMIT = 6

/**
 * The K4 limit for a column still at the old seed value; `null` when the panel set another one
 * (the panel wins) or it is already current.
 */
export function upgradedColumnLimit(current: number | null | undefined): number | null {
  return current === LEGACY_COLUMN_LIMIT ? K4_COLUMN_LIMIT : null
}

/**
 * Header navigation of the design (`boards/Main.dc.html` v20: menu and mega menu), the
 * texts 1:1. Editable in the panel afterwards; the seed writes it only when the menu is empty.
 */
export function navigationData(refs: Refs): Navigation {
  const group = (slug: string) => ref(refs.group, slug, 'group')
  const image = (file: string) => refs.image(file) ?? null
  return {
    menu: menuData(),
    shortcuts: [
      { label: 'Kasy fiskalne', href: '/oferta/kasy-fiskalne' },
      { label: 'Terminale', href: '/oferta/terminale-platnicze' },
      { label: 'Bezpłatny przegląd IT', href: '/opieka-it#przeglad' },
      // TODO(krystian): address of the KSeF post once it exists (B11).
      { label: 'KSeF 2027', href: '/aktualnosci' },
    ],
    columnLimit: K4_COLUMN_LIMIT,
    highlights: [
      { group: group('prog'), label: 'GoPOS', href: '/gopos', badge: 'partner' },
      { group: group('prog'), label: 'InsERT', href: '/insert', badge: 'partner' },
      { group: group('usl'), label: 'Opieka IT', href: '/opieka-it', badge: 'abonament' },
      { group: group('usl'), label: 'Przegląd IT', href: '/opieka-it#przeglad', badge: '0 zł' },
    ],
    cards: [
      {
        title: 'GoPOS dla gastronomii',
        text: 'Wdrożenie, sprzęt, szkolenie w lokalu, serwis w sezonie.',
        href: '/gopos',
        badge: 'Autoryzowany partner',
        dark: true,
        partner: refs.partner('GoPOS') ?? null,
        image: image('p-gopos-zestaw.webp'),
      },
      {
        title: 'Subiekt i programy InsERT',
        text: 'Dobór, przeniesienie danych, KSeF, szkolenie.',
        href: '/insert',
        badge: 'Autoryzowany partner',
        partner: refs.partner('InsERT') ?? null,
        image: image('p-insert-subiekt-nexo.webp'),
      },
    ],
  }
}
