import { describe, expect, it } from 'vitest'

import { META_DESCRIPTION_MAX } from '../seo/description'
import {
  biznesDescription,
  fitTitle,
  localDescription,
  localTitle,
  META_DESCRIPTION_MIN,
  TITLE_BASE_MAX,
  TITLE_BASE_MIN,
  TITLE_SUFFIX,
} from './seo'

describe('biznesDescription (audit 0611 P1-8: 100–155 characters)', () => {
  it('completes a short panel text with who and where, up to 100+ characters', () => {
    for (const text of [
      'Drukarki etykiet.',
      'Zasilacze awaryjne',
      'Słowo '.repeat(9),
      'x'.repeat(70),
    ]) {
      const description = biznesDescription(text)
      expect(description.length, text).toBeGreaterThanOrEqual(META_DESCRIPTION_MIN)
      expect(description.length, text).toBeLessThanOrEqual(META_DESCRIPTION_MAX)
    }
    expect(biznesDescription('Drukarki etykiet.')).toMatch(/^Drukarki etykiet\. Doradzimy/)
  })

  it('cuts a long text and keeps a fitting one as it is', () => {
    expect(biznesDescription('Słowo '.repeat(60)).length).toBeLessThanOrEqual(META_DESCRIPTION_MAX)
    const fitting =
      'Kasy fiskalne online z doborem, fiskalizacją i serwisem w Rabce-Zdroju — wycena na piśmie, bez zobowiązań.'
    expect(biznesDescription(fitting)).toBe(fitting)
  })
})

describe('localTitle (SEO lokalne 13.11: the region in every category title that fits)', () => {
  it('adds the region in the longest form that fits 60 characters with the suffix', () => {
    expect(localTitle('Kasy fiskalne')).toBe('Kasy fiskalne — Rabka-Zdrój i Podhale')
    expect(localTitle('Laptopy')).toBe('Laptopy dla firm — Rabka-Zdrój i Podhale')
    expect(localTitle('Terminale płatnicze i PIN-pady')).toBe(
      'Terminale płatnicze i PIN-pady — Rabka',
    )
    for (const base of ['Kasy fiskalne', 'Laptopy', 'Drukarki i urządzenia wielofunkcyjne'])
      expect(localTitle(base).length + TITLE_SUFFIX.length, base).toBeLessThanOrEqual(60)
  })

  it('does not repeat „dla firm” or a region the title already names', () => {
    expect(localTitle('Laptopy dla firm')).toBe('Laptopy dla firm — Rabka-Zdrój i Podhale')
    expect(localTitle('Opieka IT na Podhalu')).toBe('Opieka IT na Podhalu')
  })

  it('keeps the first part before a dash with the region when the whole does not fit', () => {
    expect(localTitle('Automaty vendingowe — modele Optivendi')).toBe(
      'Automaty vendingowe — Rabka-Zdrój i Podhale',
    )
  })

  it('puts the region on the short part of a long panel title', () => {
    expect(localTitle('Systemy dla gastronomii: GoPOS, Sunmi, Posnet')).toBe(
      'Systemy dla gastronomii — Rabka-Zdrój',
    )
  })

  it('keeps a title too long for any region as fitTitle does', () => {
    const long = 'Drukarki i urządzenia wielofunkcyjne A4 i A3'
    expect(localTitle(long)).toBe(fitTitle(long))
  })
})

describe('localDescription (SEO lokalne 13.11: where we work, in every description)', () => {
  const lead =
    'Posnet, Elzab i Fawag — od kieszonkowej kasy dla mechanika po kasę systemową do sklepu ze skanerem. Programujemy, fiskalizujemy, szkolimy i serwisujemy.'

  it('ends a description without a region with where we work, within 155 characters', () => {
    const description = localDescription(lead)
    expect(description).toMatch(/Rabce-Zdroju/)
    expect(description).toMatch(/^Posnet, Elzab i Fawag/)
    expect(description.length).toBeLessThanOrEqual(META_DESCRIPTION_MAX)
    expect(description.length).toBeGreaterThanOrEqual(META_DESCRIPTION_MIN)
  })

  it('keeps a description that already names the region as biznesDescription does', () => {
    const local =
      'Komputery dla firm z Podhala z wdrożeniem i serwisem. Dobór, dostawa i konfiguracja.'
    expect(localDescription(local)).toBe(biznesDescription(local))
  })

  it('cuts a very long first sentence on a word and still adds the region', () => {
    const description = localDescription('Słowo '.repeat(60))
    expect(description).toMatch(/Rabce-Zdroju/)
    expect(description.length).toBeLessThanOrEqual(META_DESCRIPTION_MAX)
  })
})

describe('fitTitle (audit 0611 P1-8: 30–60 characters with „ | PRO-KOM Biznes”)', () => {
  const full = (base: string) => base.length + TITLE_SUFFIX.length

  it('extends a short title with the given words when they fit', () => {
    expect(fitTitle('Laptopy', 'dla firm — Rabka-Zdrój')).toBe('Laptopy dla firm — Rabka-Zdrój')
    expect(full(fitTitle('Sieć i Wi-Fi', 'dla firm — Rabka-Zdrój'))).toBeGreaterThanOrEqual(30)
  })

  it('keeps the first part of a long title (before „ — ” or „: ”), else cuts on a word', () => {
    expect(
      fitTitle('KSeF od 1 stycznia 2027: 6 rzeczy, które mała firma musi zrobić do grudnia'),
    ).toBe('KSeF od 1 stycznia 2027')
    expect(fitTitle('Posnet Ergo Online — Ergo ONLINE, Ergo ONLINE z Wi-Fi i modemem')).toBe(
      'Posnet Ergo Online',
    )
    const cut = fitTitle('Urządzenie wielofunkcyjne biurowe do dużych zespołów i działów')
    expect(cut.length).toBeLessThanOrEqual(TITLE_BASE_MAX)
    expect(cut).not.toMatch(/[\s,—-]$/)
  })

  it('without `head`: cuts the whole title on a word, so similar names stay apart', () => {
    expect(
      fitTitle('Wi-Fi dla gości i firmy — TP-Link Omada z hotspotem na vouchery', undefined, {
        head: false,
      }),
    ).toBe('Wi-Fi dla gości i firmy — TP-Link Omada')
    // A short number is part of the model, not a dangling word.
    expect(fitTitle('Lenovo ThinkStation P3 Tiny Ultra Gen 2 i inne modele')).toBe(
      'Lenovo ThinkStation P3 Tiny Ultra Gen 2',
    )
  })

  it('keeps a title that fits and never returns less than it got', () => {
    expect(fitTitle('Kasy fiskalne dla sklepu i usług')).toBe('Kasy fiskalne dla sklepu i usług')
    // Too short with nothing to add: as it is (the panel can set a longer one).
    expect(fitTitle('GoPOS')).toBe('GoPOS')
    expect(TITLE_BASE_MIN).toBe(13)
  })
})
