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
    steps: [{ title: 'Lista', text: 'Wyślij.', callback: true }],
  }

  it('drops flagged items and swaps in the fallback while the flags are off', () => {
    expect(applyFlags(data, NO_FLAGS)).toEqual({
      stats: [{ value: 'od 2004', label: 'firma' }],
      faq: [{ q: 'Gwarancja?', a: 'Producenta.' }],
      nested: { list: [{ name: 'Bosch' }] },
      steps: [{ title: 'Lista', text: 'Wyślij.', callback: true }],
    })
  })

  it('keeps flagged items without the markers once the flag is on', () => {
    const on = applyFlags(data, { pickup: true, warranty: true, lg: true, callback: true })
    expect(on.stats[1]).toEqual({ value: '1 za 1', label: 'odbiór' })
    expect(on.faq[0]).toEqual({ q: 'Gwarancja?', a: 'Zgłoszenie na miejscu.' })
    expect(on.nested.list.map((item) => item.name)).toEqual(['LG', 'Bosch'])
  })

  it('drops an item flagged with an unknown condition', () => {
    expect(applyFlags([{ a: 1, when: 'other' }, { a: 2 }], NO_FLAGS)).toEqual([{ a: 2 }])
  })
})
