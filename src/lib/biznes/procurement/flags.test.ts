import { describe, expect, it } from 'vitest'

import { applyFlags, NO_FLAGS } from './flags'

describe('applyFlags (ZAOPATRZENIE §0 — conditional texts only with the panel entry)', () => {
  const data = {
    stats: [
      { value: 'od 2004', label: 'firma' },
      { value: '1 za 1', label: 'odbiór', when: 'pickup' },
    ],
    faq: [
      {
        q: 'Gwarancja?',
        a: 'Zgłoszenie na miejscu.',
        when: 'warranty',
        fallback: { q: 'Gwarancja?', a: 'Producenta.' },
      },
    ],
    nested: { list: [{ name: 'LG', when: 'lg' }, { name: 'Bosch' }] },
    chips: [{ text: 'Dane przeniesione', when: 'services' }],
    steps: [
      {
        title: 'Lista',
        text: 'Wyślij. {callback} w godzinach pracy.',
        when: 'callback',
        fallback: { title: 'Lista', text: 'Wyślij.' },
      },
    ],
  }

  it('drops flagged items and swaps in the fallback while the flags are off', () => {
    expect(applyFlags(data, NO_FLAGS)).toEqual({
      stats: [{ value: 'od 2004', label: 'firma' }],
      faq: [{ q: 'Gwarancja?', a: 'Producenta.' }],
      nested: { list: [{ name: 'Bosch' }] },
      chips: [],
      steps: [{ title: 'Lista', text: 'Wyślij.' }],
    })
  })

  it('keeps flagged items without the markers once the flag is on', () => {
    const on = applyFlags(data, {
      pickup: true,
      warranty: true,
      lg: true,
      services: true,
      callback: 'Oddzwaniamy w ciągu 60 minut',
    })
    expect(on.stats[1]).toEqual({ value: '1 za 1', label: 'odbiór' })
    expect(on.faq[0]).toEqual({ q: 'Gwarancja?', a: 'Zgłoszenie na miejscu.' })
    expect(on.nested.list.map((item) => item.name)).toEqual(['LG', 'Bosch'])
    expect(on.chips).toEqual([{ text: 'Dane przeniesione' }])
  })

  it('puts the panel promise in place of {callback}, whatever it says (§0 pkt 7)', () => {
    const on = applyFlags(data, { ...NO_FLAGS, callback: 'Oddzwaniamy w ciągu 2 godzin' })
    expect(on.steps[0]).toEqual({
      title: 'Lista',
      text: 'Wyślij. Oddzwaniamy w ciągu 2 godzin w godzinach pracy.',
    })
  })

  it('treats a blank promise as no promise', () => {
    expect(applyFlags(data, { ...NO_FLAGS, callback: '  ' }).steps[0]!.text).toBe('Wyślij.')
  })

  it('drops an item flagged with an unknown or inherited condition', () => {
    expect(
      applyFlags([{ a: 1, when: 'other' }, { a: 2, when: 'toString' }, { a: 3 }], NO_FLAGS),
    ).toEqual([{ a: 3 }])
  })
})
