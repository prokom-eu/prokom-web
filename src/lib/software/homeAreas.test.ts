import { describe, expect, it } from 'vitest'

import { type HomeAreaDoc, homeAreas } from './homeAreas'

const area = (overrides: Partial<HomeAreaDoc> = {}): HomeAreaDoc => ({
  key: 'www',
  name: 'Strony internetowe',
  icon: 'site',
  short: 'Firmowe, dla noclegów',
  description: 'Opis',
  gain: 'Klient znajduje Cię w Google',
  countLabel: '7 rozwiązań',
  priceFrom: 999,
  priceLabel: null,
  chips: [],
  cta: { label: 'Zobacz strony', href: '/rozwiazania?kategoria=strony' },
  ...overrides,
})

describe('homeAreas', () => {
  it('takes the price label first, then „od {cena} zł”, then asks for a quote', () => {
    const [labelled, priced, empty] = homeAreas(
      [
        area({ priceLabel: 'od 149 zł / mies.' }),
        area({ priceFrom: 999 }),
        area({ priceFrom: null }),
      ],
      new Map(),
    )
    expect(labelled?.price).toBe('od 149 zł / mies.')
    expect(priced?.price).toBe('od 999 zł')
    expect(empty?.price).toBe('Zapytaj o wycenę')
  })

  it('links a chip only to a solution published in the tenant', () => {
    const [result] = homeAreas(
      [
        area({
          chips: [
            { label: 'Wizytówka', solution: 1 },
            { label: 'Szkic', solution: 2 },
            { label: 'PWA', solution: null },
          ],
        }),
      ],
      new Map([[1, 'strona-wizytowka']]),
    )
    expect(result?.chips).toEqual([
      { label: 'Wizytówka', href: '/rozwiazania/strona-wizytowka' },
      { label: 'Szkic', href: null },
      { label: 'PWA', href: null },
    ])
  })

  it('drops a button without a label or with an unsafe link', () => {
    const [noLabel, unsafe] = homeAreas(
      [
        area({ cta: { label: ' ', href: '/rozwiazania' } }),
        area({ cta: { label: 'X', href: 'javascript:alert(1)' } }),
      ],
      new Map(),
    )
    expect(noLabel?.cta).toBeNull()
    expect(unsafe?.cta).toBeNull()
  })

  it('keeps only known icons and trims empty texts to null', () => {
    const [result] = homeAreas([area({ icon: null, gain: '  ' })], new Map())
    expect(result).toMatchObject({ icon: null, gain: null })
  })
})
