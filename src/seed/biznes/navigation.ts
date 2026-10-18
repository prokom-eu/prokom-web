import type { SiteSetting } from '@/payload-types'

type Navigation = NonNullable<NonNullable<SiteSetting['biznes']>['navigation']>

type Refs = {
  /** Seed slug of a group (`sprz`, `prog`…) → id. */
  group: (slug: string) => number | undefined
  /** Seed slug of an industry (`gastro`…) → id. */
  industry: (slug: string) => number | undefined
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

/**
 * Header navigation of the design (`boards/Main.dc.html`: menu, mega menu, Branże ▾), the
 * texts 1:1. Editable in the panel afterwards; the seed writes it only when the menu is empty.
 */
export function navigationData(refs: Refs): Navigation {
  const group = (slug: string) => ref(refs.group, slug, 'group')
  const industry = (slug: string) => ref(refs.industry, slug, 'industry')
  const image = (file: string) => refs.image(file) ?? null
  return {
    menu: [
      { type: 'offer', label: 'Oferta', href: '/oferta' },
      { type: 'link', label: 'Opieka IT', href: '/opieka-it' },
      { type: 'link', label: 'GoPOS', href: '/gopos', partner: true },
      { type: 'link', label: 'InsERT', href: '/insert', partner: true },
      { type: 'industries', label: 'Branże' },
      { type: 'link', label: 'O firmie', href: '/o-firmie' },
      { type: 'link', label: 'Kontakt', href: '/kontakt' },
    ],
    shortcuts: [
      { label: 'Kasy fiskalne', href: '/oferta/kasy-fiskalne' },
      { label: 'Terminale', href: '/oferta/terminale-platnicze' },
      { label: 'Bezpłatny przegląd IT', href: '/opieka-it#przeglad' },
      // TODO(krystian): address of the KSeF post once it exists (B11).
      { label: 'KSeF 2027', href: '/aktualnosci' },
    ],
    columnLimit: 6,
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
    industries: [
      {
        industry: industry('gastro'),
        description: 'restauracje, kawiarnie, bary — GoPOS, Sunmi, Posnet',
        image: image('p-gopos-zestaw.webp'),
      },
      {
        industry: industry('handel'),
        description: 'kasy, Subiekt, PC-Market, skanery, wagi',
        image: image('p-posnet-neo.webp'),
      },
      {
        industry: industry('noclegi'),
        description: 'NFHotel, Wi-Fi, recepcja, restauracja hotelowa',
        image: image('p-nfhotel.webp'),
      },
    ],
  }
}
