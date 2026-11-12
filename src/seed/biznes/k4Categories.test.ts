import { describe, expect, it } from 'vitest'

import icons from '../../../seed/prokombiznes/ikony.json'
import k3Dictionaries from '../../../seed/prokombiznes/k3/slowniki-k3.json'
import k4Catalog from '../../../seed/prokombiznes/k4/katalog-k4.json'
import k4Dictionaries from '../../../seed/prokombiznes/k4/slowniki-k4.json'
import { isIconName } from '../../lib/catalog/options'
import { isValidSlug } from '../../lib/tenant/uniqueSlug'
import { SUBCATEGORY_PAGES } from './k3'
import { k31Dictionaries } from './k31'
import { k31Featured, k31Input } from './k31Data'
import {
  k4CardPlacement,
  k4CategoryData,
  k4CategoryIcons,
  k4CategoryRedirects,
  k4Dictionaries as toK4,
  isRetiredTarget,
  type K4Category,
} from './k4Categories'
import { CATEGORY_SLUGS } from './map'

const k3 = k31Dictionaries(k3Dictionaries, k31Featured)
const dictionaries = toK4(k3, k4Dictionaries)
const byCode = (code: string) => dictionaries.kategorie.find((item) => item.slug === code)!
const k4Cards = new Map(k4Catalog.produkty.map((card) => [card.slug_seed, card]))

describe('k4Dictionaries (D-K4-2)', () => {
  it('has the 5 departments and 29 categories of the package, in its order', () => {
    expect(dictionaries.grupy.map((group) => group.slug)).toEqual([
      'sprz',
      'biuro',
      'prog',
      'bezp',
      'usl',
    ])
    expect(dictionaries.kategorie.map((category) => category.slug)).toEqual(
      k4Dictionaries.kategorie.map((category) => category.kod),
    )
    expect(dictionaries.kategorie.map((category) => category.kolejnosc)).toEqual(
      dictionaries.kategorie.map((_, index) => index),
    )
  })

  it('takes department names from K4, keeps K3 icons and gradients', () => {
    const bezp = dictionaries.grupy.find((group) => group.slug === 'bezp')!
    expect(bezp.nazwa).toBe('Sieć, bezpieczeństwo i podpis')
    expect(bezp.ikona).toBe('shield')
    expect(bezp.gradient).toHaveLength(2)
  })

  it('puts every category in the department that lists it', () => {
    for (const department of k4Dictionaries.dzialy) {
      for (const code of department.kategorie) expect(byCode(code).grupa).toBe(department.slug)
    }
  })

  it('gives subcategories their "Do czego" and help card from the package', () => {
    const ups = byCode('serw').podkategorie.find((row) => row.slug === 'ups')!
    expect(ups.do_czego).toContain('Kasa i jedno stanowisko')
    expect(ups.dobor).toMatchObject({ t: 'Nie wiesz, jaki UPS?', a: 'kontakt' })
    const drawers = byCode('akc').podkategorie[0]!
    expect(drawers).toMatchObject({ nazwa: 'Szuflady kasowe', do_czego: [], dobor: null })
  })

  it('maps every code to a valid, unique address', () => {
    const slugs = dictionaries.kategorie.map((category) => CATEGORY_SLUGS[category.slug])
    for (const slug of slugs) expect(slug && isValidSlug(slug)).toBe(true)
    expect(new Set(slugs).size).toBe(slugs.length)
    expect(CATEGORY_SLUGS.laptopy).toBe('laptopy')
    expect(CATEGORY_SLUGS.komp).toBeUndefined()
  })

  it('gives every subcategory a valid address, unique in its category', () => {
    for (const category of dictionaries.kategorie) {
      const slugs = category.podkategorie.map((row) => row.slug)
      for (const slug of slugs) expect(isValidSlug(slug)).toBe(true)
      expect(new Set(slugs).size).toBe(slugs.length)
    }
  })

  it('fails on a category in an unknown department', () => {
    const broken = {
      ...k4Dictionaries,
      kategorie: [{ ...k4Dictionaries.kategorie[0]!, dzial: 'nowy' }],
    }
    expect(() => toK4(k3, broken)).toThrow(/department "nowy"/)
  })

  it('fails on a department listing a category the dictionary lacks', () => {
    const broken = {
      ...k4Dictionaries,
      dzialy: k4Dictionaries.dzialy.map((department, index) =>
        index === 0 ? { ...department, kategorie: [...department.kategorie, 'nowa'] } : department,
      ),
    }
    expect(() => toK4(k3, broken)).toThrow(/unknown category "nowa"/)
  })
})

describe('k4CategoryData', () => {
  const data = (code: string) =>
    k4CategoryData(byCode(code), 7, k4CategoryIcons(icons.kategoria_ikona))

  it('writes the address, group, icon; subcategory pages only in serw, av and mfp', () => {
    expect(data('laptopy')).toMatchObject({
      name: 'Laptopy',
      slug: 'laptopy',
      group: 7,
      icon: 'monitor',
      useCases: [],
      subcategories: [],
    })
    expect(data('mfp').subcategories.map((row) => row.slug)).toEqual([
      'laser-mono',
      'laser-kolor',
      'atramentowe',
      'skanery',
      'mfp-biuro',
    ])
    // ADR-012 rozstrz. 14: elsewhere a subcategory is a chip without an address.
    expect(data('akc').subcategories.map((row) => row.slug)).toEqual([null, null, null, null])
    expect(data('niszczarki').subcategories.every((row) => row.slug === null)).toBe(true)
  })

  it('gives the vending category its own title (the page /automaty-vendingowe has the name)', () => {
    expect(data('vend')).toMatchObject({
      slug: 'automaty-vendingowe',
      seo: { title: 'Automaty vendingowe — modele Optivendi' },
    })
    expect(data('laptopy')).not.toHaveProperty('seo')
  })

  it('leaves the help card of a category alone until K4d (B10a texts of kasy stay)', () => {
    expect(data('kasy')).not.toHaveProperty('help')
    expect(data('vend')).not.toHaveProperty('help')
    expect(data('vend').useCases).toContain('Świeża żywność')
  })

  it('clears the help card of a subcategory without one (the array is rewritten)', () => {
    const [nas] = data('serw').subcategories.filter((row) => row.slug === 'nas')
    expect(nas!.help).toMatchObject({ title: 'Nie wiesz, jaki NAS?', action: 'inquiry' })
    expect(data('akc').subcategories[0]!.help).toEqual({
      title: null,
      text: null,
      button: null,
      action: null,
    })
  })

  it('has an icon for every K4 category', () => {
    const map = k4CategoryIcons(icons.kategoria_ikona)
    for (const category of dictionaries.kategorie) {
      if (['wagi', 'kody', 'vend'].includes(category.slug)) continue // group icon, as in K3
      expect(isIconName(map[category.slug])).toBe(true)
    }
  })

  it('fails on an unknown help action', () => {
    const vend = byCode('vend')
    const category: K4Category = {
      ...vend,
      podkategorie: [{ ...vend.podkategorie[0]!, dobor: { t: 'a', d: 'b', b: 'c', a: 'x' } }],
    }
    expect(() => k4CategoryData(category, 1, {})).toThrow(/help action "x"/)
  })
})

describe('k4CardPlacement', () => {
  it('takes the K4 card when there is one', () => {
    expect(
      k4CardPlacement(
        { slug_seed: 'kyo', kategoria: 'mfp', podkategoria: null },
        new Map([['kyo', { kategoria: 'mfp', podkategoria: 'mfp-biuro' }]]),
        dictionaries.kategorie,
      ),
    ).toEqual({ kategoria: 'mfp', podkategoria: 'mfp-biuro', unknownSubcategory: null })
  })

  it('moves a K3 card of "Komputery i monitory" by its subcategory', () => {
    const place = (podkategoria: string) =>
      k4CardPlacement(
        { slug_seed: 'x', kategoria: 'komp', podkategoria },
        new Map(),
        dictionaries.kategorie,
      ).kategoria
    expect(place('laptopy')).toBe('laptopy')
    expect(place('monitory')).toBe('monitory')
    expect(place('stacje-robocze')).toBe('komputery')
  })

  it('drops a subcategory equal to the category, reports one missing in the dictionary', () => {
    const cards = new Map([
      ['a', { kategoria: 'laptopy', podkategoria: 'laptopy' }],
      ['b', { kategoria: 'telefony', podkategoria: 'smartfony' }],
    ])
    const place = (slug: string) =>
      k4CardPlacement({ slug_seed: slug, kategoria: 'komp' }, cards, dictionaries.kategorie)
    expect(place('a')).toEqual({
      kategoria: 'laptopy',
      podkategoria: null,
      unknownSubcategory: null,
    })
    expect(place('b')).toEqual({
      kategoria: 'telefony',
      podkategoria: null,
      unknownSubcategory: 'telefony/smartfony',
    })
  })

  it('finds a subcategory by its name as well (akc, wagi, kody)', () => {
    const cards = new Map([['szuf', { kategoria: 'akc', podkategoria: 'Szuflady kasowe' }]])
    expect(
      k4CardPlacement({ slug_seed: 'szuf', kategoria: 'akc' }, cards, dictionaries.kategorie),
    ).toMatchObject({ podkategoria: 'szuflady-kasowe' })
  })

  it('fails on a category K4 does not know', () => {
    expect(() =>
      k4CardPlacement({ slug_seed: 'x', kategoria: 'nowa' }, new Map(), dictionaries.kategorie),
    ).toThrow(/category "nowa"/)
  })

  it('places every K3 / K3.1 card; unknown subcategories are only the expected ones', () => {
    const cards = [...k31Input.k3Cards, ...k31Input.newCards]
    const unknown = new Set<string>()
    for (const card of cards) {
      const placed = k4CardPlacement(card, k4Cards, dictionaries.kategorie)
      expect(CATEGORY_SLUGS[placed.kategoria]).toBeDefined()
      if (placed.unknownSubcategory) unknown.add(placed.unknownSubcategory)
    }
    expect([...unknown].sort()).toEqual([
      'komputery/stacje-dokujace',
      'komputery/stacje-robocze',
      'laptopy/stacje-robocze',
    ])
  })
})

describe('k4CategoryRedirects (301 from K3 addresses)', () => {
  const rules = k4CategoryRedirects(k3.kategorie, dictionaries.kategorie, SUBCATEGORY_PAGES)

  it('sends the K3 category and its subcategory pages to the new categories', () => {
    expect(rules).toEqual(
      expect.arrayContaining([
        { from: '/oferta/komputery-monitory', to: '/oferta' },
        { from: '/oferta/komputery-monitory/laptopy', to: '/oferta/laptopy' },
        { from: '/oferta/komputery-monitory/komputery', to: '/oferta/komputery' },
        { from: '/oferta/komputery-monitory/monitory', to: '/oferta/monitory' },
        { from: '/oferta/komputery-monitory/stacje-robocze', to: '/oferta/komputery' },
      ]),
    )
  })

  it('leaves addresses that still answer alone (serw, av keep their subcategories)', () => {
    expect(rules.every((rule) => rule.from.startsWith('/oferta/komputery-monitory'))).toBe(true)
  })
})

describe('isRetiredTarget (301 of an earlier import)', () => {
  it('matches the retired category and its pages only', () => {
    expect(isRetiredTarget('/oferta/komputery-monitory')).toBe(true)
    expect(isRetiredTarget('/oferta/komputery-monitory/laptopy')).toBe(true)
    expect(isRetiredTarget('/oferta/komputery-monitory-x')).toBe(false)
    expect(isRetiredTarget('/oferta/laptopy')).toBe(false)
    expect(isRetiredTarget('/produkt/lenovo-v14-g4')).toBe(false)
  })
})
