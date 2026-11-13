import { describe, expect, it } from 'vitest'

import { softwareLlmsTxt } from './llms'
import { DEFAULT_PRICE_DISPLAY } from './solutionsIndex'

const input = {
  origin: 'https://prokomsoftware.pl',
  name: 'PRO-KOM Software',
  phone: '883 200 151',
  email: 'kontakt@prokomsoftware.pl',
  address: 'ul. Orkana 16B, 34-700 Rabka-Zdrój',
  priceDisplay: DEFAULT_PRICE_DISPLAY,
  solutions: [
    {
      name: 'Strona wizytówka',
      slug: 'strona-wizytowka',
      lead: 'Telefon, oferta i mapa.',
      priceFrom: 999,
      priceMonthly: false,
      leadTime: 'od 1 tygodnia',
    },
    {
      name: 'Opieka nad stroną',
      slug: 'opieka',
      priceFrom: 149,
      priceMonthly: true,
      leadTime: null,
    },
    {
      name: 'Asystent AI',
      slug: 'asystent-ai',
      priceFrom: null,
      priceMonthly: false,
      leadTime: null,
    },
  ],
  industries: [],
  cities: [{ name: 'Rabka-Zdrój', href: '/miejscowosci/rabka-zdroj' }],
}

describe('softwareLlmsTxt (SEO etap 1)', () => {
  const text = softwareLlmsTxt(input)
  const lines = text.split(/\r?\n/)

  it('says who we are and where we work: Rabka, Podhale, Małopolska, all Poland', () => {
    expect(text.startsWith('# PRO-KOM Software\n')).toBe(true)
    expect(text).toContain('Rabka-Zdrój, Podhale')
    expect(text).toContain('cała Małopolska')
    expect(text).toContain('zdalnie cała Polska')
    expect(lines).toContain('- Telefon: 883 200 151')
    expect(lines).toContain('- Biuro: ul. Orkana 16B, 34-700 Rabka-Zdrój.')
  })

  it('prices as the cards do — the panel words, the term, a quote without a price', () => {
    expect(lines).toContain(
      '- [Strona wizytówka](https://prokomsoftware.pl/rozwiazania/strona-wizytowka): od 999 zł netto, od 1 tygodnia. Telefon, oferta i mapa.',
    )
    expect(lines).toContain(
      '- [Asystent AI](https://prokomsoftware.pl/rozwiazania/asystent-ai): Wycena po rozmowie.',
    )
  })

  it('names the cheapest care from Solutions, not a number in code', () => {
    expect(lines).toContain('- Opieka nad stroną: od 149 zł / mies.')
    const cheaper = softwareLlmsTxt({
      ...input,
      solutions: input.solutions.map((s) => (s.slug === 'opieka' ? { ...s, priceFrom: 99 } : s)),
    })
    expect(cheaper.split(/\r?\n/)).toContain('- Opieka nad stroną: od 99 zł / mies.')
  })

  it('has the city pages and skips empty sections', () => {
    expect(text).toContain('## Miejscowości')
    expect(text).not.toContain('## Dla branż')
  })
})
