import { describe, expect, it } from 'vitest'

import { fixIndustryTexts, fixTexts } from './textFixes'

describe('fixIndustryTexts (audit 01.11.2026)', () => {
  const day = { heading: 'Od otwarcia do raportu dobowego.', steps: [] }

  it('gives the same old heading a different text on each industry page', () => {
    expect(fixIndustryTexts('gastronomia', { day }).day).toEqual({
      heading: 'Dzień w restauracji',
      steps: [],
    })
    expect(fixIndustryTexts('handel', { day }).day).toEqual({
      heading: 'Dzień w sklepie',
      steps: [],
    })
  })

  it('keeps the restaurant H1 and gives the H2 that repeated it its own text', () => {
    const h1 = 'Restauracja, która nie gubi zamówień. Nawet w sezonie.'
    const fixed = fixIndustryTexts('gastronomia', { hero: { title: h1 }, flow: { heading: h1 } })
    expect(fixed.hero).toEqual({ title: h1 })
    expect(fixed.flow).toEqual({ heading: 'Jak wygląda zamówienie w restauracji z GoPOS' })
  })

  it('drops „5 minut rozmowy” from the cash register category', () => {
    expect(
      fixTexts({
        contact: { heading: 'Nie wiesz, która kasa? Zadzwoń — dobierzemy w 5 minut rozmowy.' },
      }),
    ).toEqual({ contact: { heading: 'Nie wiesz, która kasa? Zadzwoń, pomożemy wybrać.' } })
  })
})

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

  it('changes a short heading only as a whole field, never inside another text', () => {
    expect(fixTexts({ h1b: 'Bez obsługi.', label: 'Na piśmie' })).toEqual({
      h1b: 'Sprzedaż przez całą dobę.',
      label: 'Warianty',
    })
    const panel = 'Automat sprzedaje nocą. Bez obsługi. Na piśmie dostaniesz ofertę.'
    expect(fixTexts(panel)).toBe(panel)
  })

  it('leaves other texts untouched', () => {
    const block = { heading: 'pro-kom.eu — wspólne wejście', lead: 'Rabka-Zdrój' }
    expect(fixTexts(block)).toEqual(block)
  })
})
