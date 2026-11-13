import { describe, expect, it } from 'vitest'

import catalog from '../../../seed/prokombiznes/k4/katalog-k4.json'
import gaps from '../../lib/biznes/requiredSpecs.gaps.json'

// KATALOG-DANE-2 (PRODUKCJA-BIZNES-1211 §1, sesje 3–4): a category is added here once its
// partition is done — from then on every ready card of it keeps the production thresholds.
// Photos (≥ 3, ≥ 1200 px) are measured on the database, not here: `scripts/zdjecia-braki.ts`
// → docs/zadania/zdjecia-do-pozyskania.md (producer materials to get, list for Krystian).

/** Categories whose partition is done (partia 1: kasy, drukarki fiskalne, terminale). */
const DONE = ['kasy', 'druk', 'term']

export const MIN_DESCRIPTION = 1000
export const MIN_FAQ = 4
export const MIN_RECOMMENDED = 3
/** Sentences at least this long must be unique across cards. */
export const MIN_SHARED = 80

type Card = {
  slug_seed: string
  status: string
  kategoria: string
  opis: string[]
  faq: unknown[]
  polecane?: { slug: string }[]
}

const cards = (catalog as unknown as { produkty: Card[] }).produkty
const known = new Set(cards.map((card) => card.slug_seed))
/**
 * Texts (description, FAQ, recommendations): every category since partie 2–8 (13.11) — the
 * parameters some producers do not publish stay on the list (parametry-braki-sprawdzone.md).
 */
const DONE_TEXT = [...new Set(cards.map((card) => card.kategoria))]
const done = cards.filter((card) => card.status === 'gotowe' && DONE.includes(card.kategoria))
const doneText = cards.filter(
  (card) => card.status === 'gotowe' && DONE_TEXT.includes(card.kategoria),
)

describe('production thresholds of the finished partitions (PRODUKCJA-BIZNES-1211 §1)', () => {
  it('covers some cards', () => {
    expect(done.length).toBeGreaterThan(30)
  })

  it(`description ≥ ${MIN_DESCRIPTION} characters`, () => {
    const short = doneText
      .map((card) => [card.slug_seed, card.opis.join(' ').length] as const)
      .filter(([, length]) => length < MIN_DESCRIPTION)
    expect(short).toEqual([])
  })

  it(`FAQ ≥ ${MIN_FAQ}`, () => {
    expect(
      doneText.filter((card) => card.faq.length < MIN_FAQ).map((card) => card.slug_seed),
    ).toEqual([])
  })

  it(`„Do tego zwykle dobierają” ≥ ${MIN_RECOMMENDED} real cards of the package`, () => {
    const few = doneText.filter(
      (card) =>
        (card.polecane ?? []).filter((item) => known.has(item.slug) && item.slug !== card.slug_seed)
          .length < MIN_RECOMMENDED,
    )
    expect(few.map((card) => card.slug_seed)).toEqual([])
  })

  it('description: no long sentence shared by two cards (own text per model, 13.11)', () => {
    // A template paragraph pasted into a whole brand reads as thin content to search engines
    // and to a buyer comparing models; short phrases (< MIN_SHARED) may repeat.
    const seen = new Map<string, string>()
    const shared: string[] = []
    for (const card of doneText)
      for (const sentence of card.opis.join(' ').split(/(?<=[.!?])\s+/)) {
        const text = sentence.trim()
        if (text.length < MIN_SHARED) continue
        const first = seen.get(text)
        if (first && first !== card.slug_seed) shared.push(`${card.slug_seed} = ${first}: ${text}`)
        else seen.set(text, card.slug_seed)
      }
    expect(shared).toEqual([])
  })

  it('required parameters: complete, or on the list of gaps with where it was searched', () => {
    // The list only shrinks (requiredSpecs.test.ts); here: what is left in the done partitions.
    const left = done.flatMap((card) =>
      ((gaps as Record<string, string[]>)[card.slug_seed] ?? []).map(
        (label) => `${card.slug_seed}: ${label}`,
      ),
    )
    expect(left).toEqual([])
  })
})
