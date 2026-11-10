import { describe, expect, it } from 'vitest'

import k4Catalog from '../../../seed/prokombiznes/k4/katalog-k4.json'

/**
 * Depth of the product cards (local audit of 10.11.2026, §7): the cards it named get a full
 * description and four questions; every ready card keeps at least the level it has now.
 */

type Card = { slug_seed: string; status: string; opis: string[]; faq: { q: string; a: string }[] }

const cards = (k4Catalog as { produkty: Card[] }).produkty
const ready = cards.filter((card) => card.status === 'gotowe')
const length = (card: Card) => card.opis.join(' ').length

/** Audit §7: descriptions under 900 characters on the page. */
const SHORT_DESCRIPTIONS = [
  'pomoc-zdalna',
  'tusze-tonery',
  'modernizacja-komputera',
  'przeglad-it',
  'qnap-ts-855x',
  'przygotowanie-komputera',
  'integracja-kasy',
  'omada-switche-agile-es',
  'qnap-ts-262a-ts-462a',
  'kopie-zapasowe',
  'm365-poczta',
  'serwis-drukarek',
  'fellowes-automax-100m',
  'qnap-ts-h765eu-h1065eu',
  'optivendi-lodomat',
  'kyocera-taskalfa-2320-2020',
  'optivendi-pizzomat',
  'fellowes-lx220',
  'siec-wifi-montaz',
  'kyocera-ecosys-pa4000x-pa4500x',
  'fellowes-lx211',
  'brother-hl-l6210dw-hl-l6410dn',
  'kyocera-ecosys-ma2600cwfx',
  'logitech-c925e',
  'brother-hl-l2460dn-hl-l2442dw-hl-l2402d',
  'brother-ads-1300-ads-1800w',
  'optivendi-smartvend-49',
  'qnap-tvs-h474-h674-h874',
  'brother-mfc-l2802dw-mfc-l2802dn',
  'wymiana-kasy',
  'brother-mfc-b7810dw',
  'optivendi-sklep-samoobslugowy',
  'optivendi-kluczomat',
  'optivendi-kwiatomat',
  'fellowes-automax-350c',
  'fellowes-lx210',
  'logitech-mk295-silent-wireless-combo',
  'optivendi-ksiazkomat',
  'comex-cover-ps',
]

/** Audit §7: cards with two or three questions on the page. */
const FEW_QUESTIONS = [
  'optivendi-winda-2026',
  'optivendi-chlebomat',
  'comex-akumulatory-7stars',
  'comex-karty-snmp',
  'comex-cover-ats',
  'comex-cover-core-one',
  'comex-cover-basic-1k',
  'comex-cover-winter-3k',
  'tusze-tonery',
  'przeglad-it',
  'kopie-zapasowe',
  'm365-poczta',
  'siec-wifi-montaz',
  'przygotowanie-komputera',
  'pomoc-zdalna',
  'modernizacja-komputera',
  'integracja-kasy',
  'serwis-drukarek',
  'wymiana-kasy',
]

const bySlug = (slug: string) => {
  const card = cards.find((item) => item.slug_seed === slug)
  if (!card) throw new Error(`No card "${slug}" in katalog-k4.json.`)
  return card
}

describe('product cards: description and FAQ depth (audit 10.11)', () => {
  it.each(SHORT_DESCRIPTIONS)('%s has a description of at least 1000 characters', (slug) => {
    expect(length(bySlug(slug))).toBeGreaterThanOrEqual(1000)
  })

  it.each(FEW_QUESTIONS)('%s has at least four questions', (slug) => {
    expect(bySlug(slug).faq.length).toBeGreaterThanOrEqual(4)
  })

  it('no ready card falls below 600 characters of description or three questions', () => {
    const thin = ready
      .filter((card) => length(card) < 600 || card.faq.length < 3)
      .map((card) => `${card.slug_seed} (${length(card)} zn., ${card.faq.length} FAQ)`)
    expect(thin).toEqual([])
  })

  it('every question has a non-empty answer', () => {
    const empty = ready.flatMap((card) =>
      card.faq.filter((item) => !item.q.trim() || !item.a.trim()).map(() => card.slug_seed),
    )
    expect(empty).toEqual([])
  })
})
