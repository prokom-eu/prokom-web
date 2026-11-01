import { describe, expect, it } from 'vitest'

import type { City } from '@/payload-types'

import { buildCityView, cityHref } from './cities'

const city = (extra: Partial<City> = {}): City => ({
  id: 1,
  tenant: 3,
  name: 'Rabka-Zdrój',
  locative: 'z Rabki-Zdroju',
  slug: 'rabka-zdroj',
  active: true,
  hero: {
    title: 'Strony i systemy dla firm',
    titleAccent: 'z Rabki-Zdroju.',
    lead: 'Salon przy Orkana 16B.',
  },
  updatedAt: '2026-10-31T00:00:00.000Z',
  createdAt: '2026-10-31T00:00:00.000Z',
  ...extra,
})

describe('cityHref', () => {
  it('builds the address of a city page', () => {
    expect(cityHref('rabka-zdroj')).toBe('/miejscowosci/rabka-zdroj')
  })
})

describe('buildCityView', () => {
  it('gives nothing for an inactive city or one without its own hero text (no doorway pages)', () => {
    expect(buildCityView(city({ active: false }), 3)).toBeNull()
    expect(buildCityView(city({ hero: { title: 'Tytuł', lead: '' } }), 3)).toBeNull()
  })

  it('keeps the solutions of the same tenant only', () => {
    const solution = (id: number, tenant: number) =>
      ({ id, slug: `s-${id}`, tenant }) as unknown as number
    const view = buildCityView(
      city({
        who: {
          title: 'Dla kogo pracujemy najczęściej',
          items: [
            { name: 'Pensjonaty', solution: solution(1, 3), cta: 'Strona →' },
            { name: 'Obca', solution: solution(2, 1), cta: 'Nie →' },
          ],
        },
      }),
      3,
    )
    expect(view?.who.items.map((item) => item.solution)).toEqual(['s-1', null])
  })

  it('keeps the nearby places as plain names', () => {
    const view = buildCityView(city({ nearby: ['Zakopane', ' ', 'Nowy Targ'] }), 3)
    expect(view?.nearby).toEqual(['Zakopane', 'Nowy Targ'])
  })
})
