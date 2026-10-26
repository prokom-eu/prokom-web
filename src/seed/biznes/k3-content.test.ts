import { describe, expect, it } from 'vitest'

import k3Catalog from '../../../seed/prokombiznes/k3/katalog-k3.json'
import k3Dictionaries from '../../../seed/prokombiznes/k3/slowniki-k3.json'
import k3Bundles from '../../../seed/prokombiznes/k3/zestawy.json'
import k31SplitContent from '../../../seed/prokombiznes/k31/karty-podzial-tresci.json'
import k31NewCards from '../../../seed/prokombiznes/k31/katalog-k31-nowe.json'
import k31Supplements from '../../../seed/prokombiznes/k31/tresci-uzupelnienia-k31.json'
import { forbiddenContent } from '../../lib/catalog/contentRules'

/**
 * K3-KATALOG §10: no prices, instalments, leasing, "free" offers or banned brands in anything
 * the site shows. Internal fields (`uwagi`, `do_potwierdzenia`, `uwagi_wewnetrzne`…) and source
 * links are not public, so they are left out.
 */

/** Every text of a value, with the path to it (for a readable failure). */
function texts(value: unknown, at: string): [string, string][] {
  if (typeof value === 'string') return [[at, value]]
  if (Array.isArray(value)) return value.flatMap((item, index) => texts(item, `${at}[${index}]`))
  if (value && typeof value === 'object') {
    return Object.entries(value).flatMap(([key, item]) => texts(item, `${at}.${key}`))
  }
  return []
}

function violations(items: [string, string][]): string[] {
  return items.flatMap(([at, text]) =>
    forbiddenContent(text).map((rule) => `${at}: ${rule} — „${text.slice(0, 80)}”`),
  )
}

function omit<T extends object>(value: T, keys: string[]): Partial<T> {
  return Object.fromEntries(
    Object.entries(value).filter(([key]) => !keys.includes(key)),
  ) as Partial<T>
}

describe('K3 content rules (K3-KATALOG §10)', () => {
  it('has no price or banned brand in the public fields of the 243 cards', () => {
    const internal = ['uwagi', 'zrodla', 'legacyIds', 'nazwa_poprzednia', 'slug_seed', 'status']
    const items = k3Catalog.produkty.flatMap((card) => texts(omit(card, internal), card.slug_seed))
    expect(items.length).toBeGreaterThan(5000)
    expect(violations(items)).toEqual([])
  })

  it('has none in categories and brand pages', () => {
    const items = [
      ...texts(k3Dictionaries.kategorie, 'kategorie'),
      ...k3Dictionaries.marki.flatMap((brand) =>
        texts(omit(brand, ['uwagi', 'zrodla', 'logo_url', 'strona_producenta']), brand.slug),
      ),
    ]
    expect(violations(items)).toEqual([])
  })

  it('has none in the K3.1 cards, supplements and split cards (K31a)', () => {
    const internal = ['uwagi', 'zrodla', 'slug_seed', 'status', 'zdjecia_zrodlo']
    const items = [
      ...k31NewCards.produkty.flatMap((card) => texts(omit(card, internal), card.slug_seed)),
      ...Object.entries(k31Supplements.karty).flatMap(([slug, supplement]) =>
        texts(omit(supplement, ['zrodla_dodaj']), slug),
      ),
      ...k31SplitContent.karty.flatMap((card) =>
        texts(omit(card, ['uwagi', 'zrodla', 'zdjecia', 'slug', 'z']), card.slug),
      ),
    ]
    expect(items.length).toBeGreaterThan(3000)
    expect(violations(items)).toEqual([])
  })

  it('has none in the public fields of the bundles (imported in K3c)', () => {
    const internal = ['uwagi_wewnetrzne', 'uslugi_po_akceptacji_szefa', 'sprawdzone_zgodnosci']
    const items = k3Bundles.zestawy.flatMap((bundle) => {
      const elements = bundle.elementy.map((element) => omit(element, ['do_potwierdzenia']))
      return texts({ ...omit(bundle, internal), elementy: elements }, bundle.slug)
    })
    expect(items.length).toBeGreaterThan(500)
    expect(violations(items)).toEqual([])
  })
})
