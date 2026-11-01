import { describe, expect, it } from 'vitest'

import { fixTexts } from './textFixes'

describe('fixTexts', () => {
  it('replaces the old contact inside nested blocks and rich text', () => {
    const layout = [
      {
        blockType: 'bzSection',
        lead: 'Telefon 889 003 889 albo e-mail biznes@pro-kom.eu.',
        items: [{ text: 'Drugi telefon 18 267 65 11', href: 'tel:+48182676511' }],
        content: {
          root: { children: [{ text: 'biuro@pro-kom.eu', url: 'mailto:biuro@pro-kom.eu' }] },
        },
        count: 3,
        hidden: null,
      },
    ]
    expect(fixTexts(layout)).toEqual([
      {
        blockType: 'bzSection',
        lead: 'Telefon 889 003 889 albo e-mail kontakt@prokombiznes.pl.',
        items: [{ text: 'Drugi telefon 883 200 151', href: 'tel:+48883200151' }],
        content: {
          root: {
            children: [{ text: 'kontakt@prokombiznes.pl', url: 'mailto:kontakt@prokombiznes.pl' }],
          },
        },
        count: 3,
        hidden: null,
      },
    ])
  })

  it('turns „zapisujemy w umowie” into „ustalamy w umowie” (K4-FINAL §1)', () => {
    expect(fixTexts('Zakres i czas reakcji zapisujemy w umowie. Zapisujemy go w umowie.')).toBe(
      'Zakres i czas reakcji ustalamy w umowie. Ustalamy go w umowie.',
    )
    expect(fixTexts('czas reakcji zapisany w umowie')).toBe('czas reakcji ustalony w umowie')
  })

  it('also fixes a phrase written with hard spaces by the seed, keeping them', () => {
    const nbsp = '\u00a0'
    expect(fixTexts(`Zakres i${nbsp}czas reakcji zapisujemy w${nbsp}umowie.`)).toBe(
      `Zakres i${nbsp}czas reakcji ustalamy w${nbsp}umowie.`,
    )
  })

  it('rewrites the old headings of the redaction (audit 01.11.2026) and is idempotent', () => {
    const before = {
      heading: 'Komputery, sieć i kasy pod jedną opieką.',
      headingAccent: 'Jeden numer, gdy coś stanie.',
      faq: { heading: 'Zanim zadzwonisz.' },
      note: 'pro-kom.eu: wspólne wejście. Nowa strona PRO-KOM — wkrótce.',
    }
    const after = fixTexts(before)
    expect(after).toEqual({
      heading: 'Opieka IT dla firm:',
      headingAccent: 'komputery, sieć i kasy pod jedną opieką',
      faq: { heading: 'Zanim zadzwonisz' },
      note: 'pro-kom.eu: wspólne wejście.',
    })
    expect(fixTexts(after)).toEqual(after)
  })

  it('leaves other texts untouched', () => {
    const block = { heading: 'pro-kom.eu — wspólne wejście', lead: 'Rabka-Zdrój' }
    expect(fixTexts(block)).toEqual(block)
  })
})
