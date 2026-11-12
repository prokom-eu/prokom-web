import { describe, expect, it } from 'vitest'

import catalog from '../../../seed/prokombiznes/k4/katalog-k4.json'
import salons from '../../../seed/prokombiznes/k4/salony-k4.json'

// PRODUKCJA-BIZNES-1211 §2 (sesja 2): a salon's „Która…?” tiles are models, not one card shown
// N times with the same photo — PolCard had 7 tiles on one card.

type Plan = { it: { t: string; p?: string }[] }
type Salon = { plans?: Plan | null; plans2?: Plan | null }
type Card = { slug_seed: string; rodzaj: string; zdjecia?: string[]; zdjecia_brak?: boolean }

const cards = new Map(
  (catalog as unknown as { produkty: Card[] }).produkty.map((card) => [card.slug_seed, card]),
)
const all = (salons as unknown as { salony: Record<string, Salon> }).salony

/**
 * Tiles that may show no photo of their own, with the reason: software and services have a
 * product tile, never another model's photo; the rest wait for photos (zdjecia-do-pozyskania).
 */
const NO_PHOTO_OK = (card: Card) => card.rodzaj !== 'Urządzenia'

describe('salon plan tiles (PRODUKCJA-BIZNES-1211 §2)', () => {
  it('no two tiles of a salon lead to the same card', () => {
    const repeats: string[] = []
    for (const [name, salon] of Object.entries(all)) {
      for (const plan of [salon.plans, salon.plans2]) {
        const slugs = (plan?.it ?? []).flatMap((item) => (item.p ? [item.p] : []))
        const seen = new Set<string>()
        for (const slug of slugs) {
          if (seen.has(slug)) repeats.push(`${name}: ${slug}`)
          seen.add(slug)
        }
      }
    }
    expect(repeats).toEqual([])
  })

  it('every tile points at a card of the package', () => {
    const unknown = Object.entries(all).flatMap(([name, salon]) =>
      [salon.plans, salon.plans2].flatMap((plan) =>
        (plan?.it ?? []).flatMap((item) =>
          item.p && !cards.has(item.p) ? [`${name}: ${item.p}`] : [],
        ),
      ),
    )
    expect(unknown).toEqual([])
  })

  // Device photos may come from the K3 / v2 galleries (not in `zdjecia`): the check is that no
  // device tile points at a card flagged as having no photo at all.
  it('no device tile points at a card without any photo', () => {
    const missing = Object.entries(all).flatMap(([name, salon]) =>
      [salon.plans, salon.plans2].flatMap((plan) =>
        (plan?.it ?? []).flatMap((item) => {
          const card = item.p ? cards.get(item.p) : undefined
          if (!card || NO_PHOTO_OK(card)) return []
          return card.zdjecia?.length ? [] : [`${name}: ${item.t} (${item.p})`]
        }),
      ),
    )
    // Device cards whose photos come from the K3 / v2 galleries are not in `zdjecia`: listed
    // here only when the card has no photo at all (`zdjecia_brak`).
    const withoutAny = missing.filter((entry) => {
      const slug = entry.slice(entry.lastIndexOf('(') + 1, -1)
      return cards.get(slug)?.zdjecia_brak
    })
    expect(withoutAny).toEqual([])
  })
})

describe('new K4 cards never take an older card’s sheet id', () => {
  it('no new card slug is a legacy id (`id_z_arkusza`) of another card — it would overwrite it', async () => {
    const v2 = (await import('../../../seed/prokombiznes/katalog.json')).default as unknown as {
      produkty: { slug: string; id_z_arkusza?: string[] }[]
    }
    const owner = new Map<string, string>()
    for (const product of v2.produkty)
      for (const id of product.id_z_arkusza ?? []) owner.set(id, product.slug)
    const taken = (catalog as unknown as { produkty: (Card & { zmiana_k4: string })[] }).produkty
      .filter((card) => card.zmiana_k4 === 'nowa' && owner.has(card.slug_seed))
      .map((card) => `${card.slug_seed} → ${owner.get(card.slug_seed)}`)
    expect(taken).toEqual([])
  })
})

describe('features of the new model cards (review 13.11)', () => {
  it('are whole phrases: no cut word, no lone number, no open bracket', () => {
    const slugs = /^(polcard|eset|m365|eurocert)-/
    const bad = (catalog as unknown as { produkty: (Card & { cechy: string[] })[] }).produkty
      .filter((card) => slugs.test(card.slug_seed) && card.slug_seed !== 'm365-poczta')
      .flatMap((card) =>
        card.cechy
          .filter((feature) => /^\d+$|\($|\s$/.test(feature) || feature.length > 40)
          .map((feature) => `${card.slug_seed}: „${feature}”`),
      )
    expect(bad).toEqual([])
  })
})
