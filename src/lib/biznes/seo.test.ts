import { describe, expect, it } from 'vitest'

import { META_DESCRIPTION_MAX } from '../seo/description'
import {
  biznesDescription,
  fitTitle,
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
