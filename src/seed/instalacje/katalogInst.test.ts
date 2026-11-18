import { createHash } from 'crypto'
import { existsSync, readFileSync } from 'fs'
import path from 'path'

import { describe, expect, it } from 'vitest'

import catalog from '../../../seed/prokominstalacje/katalog/katalog-inst.json'
import brands from '../../../seed/prokominstalacje/katalog/marki-inst.json'
import showrooms from '../../../seed/prokominstalacje/katalog/salony-inst.json'
import dictionaries from '../../../seed/prokominstalacje/katalog/slowniki-inst.json'
import bundles from '../../../seed/prokominstalacje/katalog/zestawy-inst.json'

// INST-K0 (ADR-029, docs/tresci/instalacje-katalog-eltrox.md §1, §5): the Instalacje catalog in
// the K4 card format, with the thresholds of the Biznes catalog (`catalogThresholds.test.ts`).

type Card = {
  slug_seed: string
  status: string
  dzial: string
  kategoria: string
  podkategoria?: string
  marka: string
  nazwa: string
  krotka: string
  korzysc: string
  opis: string[]
  cechy: string[]
  parametry: { k: string; v: string }[]
  faq: { q: string; a: string }[]
  polecane: { slug: string }[]
  zestawy?: string[]
  branze: string[]
  zrodla?: { url: string; host: string }[]
  zdjecia_premium?: { plik: string; zrodlo: string }[]
}

const cards = (catalog as unknown as { produkty: Card[] }).produkty
const ready = cards.filter((card) => card.status === 'gotowe')
const slugs = new Set(cards.map((card) => card.slug_seed))
const categories = new Map(dictionaries.kategorie.map((c) => [c.kod, c]))
const industries = new Set(dictionaries.branze)
const MIN_DESCRIPTION = 1000
const MIN_FAQ = 4
const MIN_SHARED = 80
const SENTENCE_END = /(?<=[.!?])\s+(?=[„"(]?[A-ZĄĆĘŁŃÓŚŹŻ0-9])/u
const normalize = (text: string) =>
  text
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .trim()
/** Every string of a value (a card, a showroom, a bundle): all of it may reach the page. */
const strings = (value: unknown): string[] =>
  typeof value === 'string'
    ? [value]
    : Array.isArray(value)
      ? value.flatMap(strings)
      : value && typeof value === 'object'
        ? Object.entries(value)
            // Photo and source addresses are not page text.
            .filter(([key]) => !['zrodlo', 'url', 'plik', 'host'].includes(key))
            .flatMap(([, item]) => strings(item))
        : []
const textOf = (card: Card) => strings(card).join(' ')
/** No price, stock or the 24 h promise; Polish letters need the `u` flag and lookarounds. */
const PRICE =
  /\d\s?(zł|pln)(?!\p{L})|(?<!\p{L})cen(a|ę|y|ie|ą)(?!\p{L})|(?<!\p{L})na magazynie(?!\p{L})|stan magazynowy|dostępn[eya] od ręki|(?<!\d)24\s?(h|godz)(?!\p{L})/iu
/** PRO-KOM has no status at these brands (marki-inst.json): never „autoryzowany” or „partner”. */
const STATUS = /autoryzowan|(?<!\p{L})partner/iu
/** Hikvision and Dahua are shown for information only (plan treści §1 pkt 7, KSC). */
const KSC_BRANDS = new Set(['Hikvision', 'Dahua'])
const PUBLIC_INDUSTRIES = ['Gmina i urząd', 'Szkoła i przedszkole']
/** One housing, one picture: cards allowed to share photo files. */
const SHARED_PHOTOS = [
  ['satel-slim-pir', 'satel-slim-dual'],
  ['hikvision-ds-2cd13x1g2-liu', 'hikvision-ds-2cd13x3g2-liu'],
]

describe('Instalacje catalog seed (INST-K0)', () => {
  // Plan §6: at least 110 ready cards (the rest wait for a check at the producer).
  it('has the v1 volume (≥ 110 ready cards — plan §6)', () => {
    expect(cards.length).toBeGreaterThanOrEqual(110)
    expect(ready.length).toBeGreaterThanOrEqual(110)
  })

  it('uses unique slugs', () => {
    expect(slugs.size).toBe(cards.length)
  })

  it('places every card in a known category and subcategory', () => {
    const wrong = cards.filter((card) => {
      const category = categories.get(card.kategoria)
      if (!category || category.dzial !== card.dzial) return true
      if (!card.podkategoria) return category.podkategorie.length > 0
      return !category.podkategorie.some((sub) => sub.slug === card.podkategoria)
    })
    expect(wrong.map((card) => card.slug_seed)).toEqual([])
  })

  it('names industries from the dictionary only', () => {
    const wrong = cards.flatMap((card) =>
      card.branze
        .filter((name) => !industries.has(name))
        .map((name) => `${card.slug_seed}: ${name}`),
    )
    expect(wrong).toEqual([])
  })

  it('never shows a price, stock, the 24 h promise or a brand status (spec. §2, plan §1)', () => {
    const hits = cards.filter((card) => PRICE.test(textOf(card))).map((card) => card.slug_seed)
    expect(hits).toEqual([])
    const extra = [brands, showrooms, bundles].flatMap((file) =>
      strings(file).filter(
        (text) => PRICE.test(text) || (STATUS.test(text) && !/nigdy/.test(text)),
      ),
    )
    expect(extra).toEqual([])
    expect(cards.filter((card) => STATUS.test(textOf(card))).map((card) => card.slug_seed)).toEqual(
      [],
    )
  })

  it('ready cards: three paragraphs, ≥ 1000 characters, ≥ 4 FAQ, 10–14 parameters, ≥ 3 polecane', () => {
    const weak = ready
      .filter(
        (card) =>
          card.opis.length !== 3 ||
          card.opis.join(' ').length < MIN_DESCRIPTION ||
          card.faq.length < MIN_FAQ ||
          card.parametry.length < 10 ||
          card.parametry.length > 14 ||
          card.polecane.length < 3,
      )
      .map((card) => card.slug_seed)
    expect(weak).toEqual([])
  })

  it('ready cards cite the producer (zrodla)', () => {
    const missing = ready.filter((card) => !card.zrodla?.length).map((card) => card.slug_seed)
    expect(missing).toEqual([])
  })

  it('keeps Hikvision and Dahua out of public-institution industries (KSC)', () => {
    const wrong = cards
      .filter((card) => KSC_BRANDS.has(card.marka))
      .filter((card) => card.branze.some((name) => PUBLIC_INDUSTRIES.includes(name)))
      .map((card) => card.slug_seed)
    expect(wrong).toEqual([])
  })

  it('asks each FAQ question once across the catalog', () => {
    const seen = new Map<string, string>()
    const repeated: string[] = []
    for (const card of cards) {
      for (const { q } of card.faq) {
        const key = normalize(q)
        const other = seen.get(key)
        if (other && other !== card.slug_seed) repeated.push(`${other} / ${card.slug_seed}: ${q}`)
        seen.set(key, card.slug_seed)
      }
    }
    expect(repeated).toEqual([])
  })

  it('points showrooms and bundles at existing cards', () => {
    type Showroom = { hero: string[]; fam: { p: string[] }[]; dob: { o: { p: string[] }[] } }
    type Bundle = { el: { s: string }[]; zam?: { z: string; na: string }[] }
    const fromShowrooms = Object.values(showrooms.salony as Record<string, Showroom>).flatMap(
      (salon) => [
        ...salon.hero,
        ...salon.fam.flatMap((f) => f.p),
        ...salon.dob.o.flatMap((o) => o.p),
      ],
    )
    const fromBundles = Object.values(bundles.zestawy as Record<string, Bundle>).flatMap(
      (bundle) => [
        ...bundle.el.map((item) => item.s),
        ...(bundle.zam ?? []).flatMap((item) => [item.z, item.na]),
      ],
    )
    expect([...fromShowrooms, ...fromBundles].filter((slug) => !slugs.has(slug))).toEqual([])
  })

  it('links only existing cards in polecane', () => {
    const broken = cards.flatMap((card) =>
      card.polecane.filter((p) => !slugs.has(p.slug)).map((p) => `${card.slug_seed} → ${p.slug}`),
    )
    expect(broken).toEqual([])
  })

  it(`shares no sentence of ${MIN_SHARED}+ characters between two cards (SEO)`, () => {
    const seen = new Map<string, string>()
    const shared: string[] = []
    for (const card of cards) {
      for (const sentence of card.opis.flatMap((p) => p.split(SENTENCE_END))) {
        const key = normalize(sentence)
        if (key.length < MIN_SHARED) continue
        const other = seen.get(key)
        if (other && other !== card.slug_seed) shared.push(`${other} / ${card.slug_seed}`)
        seen.set(key, card.slug_seed)
      }
    }
    expect(shared).toEqual([])
  })

  it('never shows the same photo file on two cards or twice in one gallery', () => {
    const allowed = (a: string, b: string) =>
      SHARED_PHOTOS.some((pair) => pair.includes(a) && pair.includes(b))
    const owner = new Map<string, string>()
    const clashes: string[] = []
    for (const card of cards) {
      const own = new Set<string>()
      for (const { plik } of card.zdjecia_premium ?? []) {
        const file = path.join('seed', 'prokominstalacje', 'katalog', plik)
        if (!existsSync(file)) continue
        const hash = createHash('sha1').update(readFileSync(file)).digest('hex')
        if (own.has(hash)) clashes.push(`${card.slug_seed}: ${plik} twice`)
        own.add(hash)
        const other = owner.get(hash)
        if (other && other !== card.slug_seed && !allowed(other, card.slug_seed)) {
          clashes.push(`${other} / ${card.slug_seed}: ${plik}`)
        }
        owner.set(hash, card.slug_seed)
      }
    }
    expect(clashes).toEqual([])
  })

  it('has every photo file of the seed on disk', () => {
    const missing = cards.flatMap((card) =>
      (card.zdjecia_premium ?? [])
        .map((photo) => photo.plik)
        .filter((file) => !existsSync(path.join('seed', 'prokominstalacje', 'katalog', file))),
    )
    expect(missing).toEqual([])
  })
})
