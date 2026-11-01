import { describe, expect, it } from 'vitest'

import { lineCards, photoView, stepItems, teamCards, type Fill } from './aboutBlocks'

// `fill` like production: `[ROK ZAKOPANE]` and `[IMIĘ I NAZWISKO]` have no value.
const facts: Record<string, string> = { GODZINY: 'pn–pt 9:00–17:00' }
const strictFill: Fill = (value) => {
  if (!value) return null
  let missing = false
  const out = value.replace(/\[([^\]]+)\]/g, (_, key: string) => {
    if (facts[key]) return facts[key]
    missing = true
    return ''
  })
  return missing ? null : out
}

describe('photoView', () => {
  const source = { photo: null, photoCaption: 'Salon w Rabce' }

  it('shows the placeholder off production', () => {
    expect(photoView(source, () => null, false)).toEqual({
      image: null,
      caption: 'Salon w Rabce',
    })
  })

  it('never shows the placeholder on production', () => {
    expect(photoView(source, () => null, true)).toBeNull()
  })

  it('shows an uploaded photo everywhere', () => {
    expect(photoView({ ...source, photo: 7 }, (v) => (v === 7 ? 'img' : null), true)?.image).toBe(
      'img',
    )
  })
})

describe('stepItems', () => {
  it('leaves out a timeline item whose year is a missing fact', () => {
    const items = stepItems(
      [
        { id: 'a', marker: '2004', title: 'Start PRO-KOM' },
        { id: 'b', marker: '[ROK ZAKOPANE]', title: 'Salon w Zakopanem' },
      ],
      strictFill,
    )
    expect(items).toEqual([{ key: 'a', marker: '2004', title: 'Start PRO-KOM' }])
  })

  it('drops empty items and keeps icons', () => {
    expect(
      stepItems([{ id: 'x' }, { id: 'y', icon: 'pin', title: 'Na miejscu' }], strictFill),
    ).toEqual([{ key: 'y', icon: 'pin', title: 'Na miejscu' }])
  })
})

describe('teamCards', () => {
  it('splits the details into lines and fills facts', () => {
    const [card] = teamCards(
      [{ id: 'r', name: 'Rabka-Zdrój', details: 'ul. Orkana 16B\n\n[GODZINY]' }],
      strictFill,
      () => null,
    )
    expect(card?.details).toEqual(['ul. Orkana 16B', 'pn–pt 9:00–17:00'])
  })

  it('places: keeps the card and drops only the line with a missing fact', () => {
    const [card] = teamCards(
      [
        {
          id: 'z',
          name: 'Zakopane',
          details: ['PRO-KOM Zakopane', '[ADRES SALONU W ZAKOPANEM]', '[GODZINY]'].join('\n'),
        },
      ],
      strictFill,
      () => null,
      { keepCardWithoutLine: true },
    )
    expect(card?.details).toEqual(['PRO-KOM Zakopane', 'pn–pt 9:00–17:00'])
  })

  it('leaves out a card with a missing name or address fact', () => {
    const cards = teamCards(
      [
        { id: '1', name: 'Krystian Potaczek' },
        { id: '2', name: '[IMIĘ I NAZWISKO]' },
        { id: '3', name: 'Zakopane', details: '[ADRES SALONU W ZAKOPANEM]' },
      ],
      strictFill,
      () => null,
    )
    expect(cards.map((card) => card.name)).toEqual(['Krystian Potaczek'])
  })
})

describe('lineCards', () => {
  it('keeps the card and drops only its caption with a missing fact', () => {
    const [card] = lineCards(
      [
        {
          id: 'z',
          name: 'PRO-KOM Zakopane',
          address: 'salon · [ADRES SALONU W ZAKOPANEM]',
          points: [{ text: 'Otwarte [GODZINY]' }],
        },
      ],
      strictFill,
    )
    expect(card).toEqual({
      key: 'z',
      name: 'PRO-KOM Zakopane',
      points: ['Otwarte pn–pt 9:00–17:00'],
      current: false,
    })
  })
})
