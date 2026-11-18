import { existsSync } from 'fs'
import path from 'path'

import { describe, expect, it } from 'vitest'

import catalog from '../../../seed/prokominstalacje/katalog/katalog-inst.json'
import dictionaries from '../../../seed/prokominstalacje/katalog/slowniki-inst.json'

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
const textOf = (card: Card) =>
  [card.nazwa, card.krotka, card.korzysc, ...card.opis, ...card.cechy]
    .concat(card.parametry.map((p) => `${p.k} ${p.v}`))
    .concat(card.faq.flatMap((f) => [f.q, f.a]))
    .join(' ')

describe('Instalacje catalog seed (INST-K0)', () => {
  // Plan §6 asks for ≥ 110 ready cards. The AV cards wait for the producers' photo consents and
  // some cameras for a check at the producer (STAN-instalacje „Do decyzji”), so until then the
  // volume counts all cards and the ready ones keep a floor that only goes up.
  it('has the v1 volume (≥ 110 cards, ≥ 70 ready — plan §6)', () => {
    expect(cards.length).toBeGreaterThanOrEqual(110)
    expect(ready.length).toBeGreaterThanOrEqual(70)
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

  it('never shows a price, stock or the 24 h promise (spec. §2, plan §1)', () => {
    const PRICE =
      /\d\s?(zł|pln)\b|\bcen[ayę]\b|\bna magazynie\b|\bstan magazynowy\b|\bdostępn[ey] od ręki\b|\b24\s?h\b/i
    const hits = cards.filter((card) => PRICE.test(textOf(card))).map((card) => card.slug_seed)
    expect(hits).toEqual([])
  })

  it('ready cards: three paragraphs, ≥ 1000 characters, ≥ 4 FAQ, 10–14 parameters', () => {
    const weak = ready
      .filter(
        (card) =>
          card.opis.length !== 3 ||
          card.opis.join(' ').length < MIN_DESCRIPTION ||
          card.faq.length < MIN_FAQ ||
          card.parametry.length < 10 ||
          card.parametry.length > 15,
      )
      .map((card) => card.slug_seed)
    expect(weak).toEqual([])
  })

  it('ready cards cite the producer (zrodla)', () => {
    const missing = ready.filter((card) => !card.zrodla?.length).map((card) => card.slug_seed)
    expect(missing).toEqual([])
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

  it('has every photo file of the seed on disk', () => {
    const missing = cards.flatMap((card) =>
      (card.zdjecia_premium ?? [])
        .map((photo) => photo.plik)
        .filter((file) => !existsSync(path.join('seed', 'prokominstalacje', 'katalog', file))),
    )
    expect(missing).toEqual([])
  })
})
