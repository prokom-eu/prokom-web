import { describe, expect, it } from 'vitest'

import { buildLineProvider } from '@/lib/shared/search/lineProvider'

import { isIconName } from '@/lib/shared/icons'

import { buildInstSearchIndex, SERVICE_SEARCH_ICONS, type InstSearchSources } from './searchIndex'

const sources: InstSearchSources = {
  menu: {
    services: [
      {
        label: 'Bezpieczeństwo',
        items: [
          {
            key: 'kam',
            label: 'Monitoring i kamery',
            caption: 'Kamery, rejestrator',
            icon: 'cam',
            color: null,
            href: '/monitoring',
          },
        ],
      },
    ],
    objects: [
      {
        label: 'Dom i noclegi',
        items: [
          {
            key: 'pens',
            label: 'Pensjonat',
            caption: null,
            icon: 'bed',
            color: null,
            href: '/dla-kogo/pensjonaty',
          },
        ],
      },
    ],
    offer: { areas: 1, solutions: 1 },
  },
  offer: [
    {
      name: 'Monitoring i kamery',
      href: '/monitoring',
      solutions: [
        { name: 'Kamera z odstraszaniem', description: 'Światło i syrena', categories: ['Dom'] },
      ],
    },
  ],
  posts: [
    {
      slug: 'monitoring-a-rodo',
      title: 'Monitoring a RODO',
      href: '/poradnik/monitoring-a-rodo',
      category: 'Przepisy',
    },
  ],
  realizations: [
    { id: 7, title: 'Parafia św. Teresy', place: 'Rabka-Zdrój', scope: 'Nagłośnienie' },
  ],
  pages: [
    { label: 'Pełna oferta', href: '/uslugi' },
    { label: 'Pełna oferta', href: '/uslugi' },
  ],
  faq: [{ question: 'Czy kamery działają bez internetu?', answer: 'Tak, nagrywają lokalnie.' }],
}

describe('buildInstSearchIndex — catalog (ADR-029, INST-K1)', () => {
  it('lists the catalog cards as „Sprzęt” with their page and brand, after the solutions', () => {
    const index = buildInstSearchIndex({
      ...sources,
      products: [
        {
          slug: 'dahua-ipc-hfw2x49s-s-il',
          name: 'Dahua WizSense 2 tubowa',
          brand: 'Dahua',
          category: 'Kamery IP',
        },
      ],
    })
    const card = index.find((entry) => entry.group === 'Sprzęt')
    expect(card).toMatchObject({
      title: 'Dahua WizSense 2 tubowa',
      href: '/produkt/dahua-ipc-hfw2x49s-s-il',
      hint: 'Dahua · Kamery IP',
    })
    const groups = [...new Set(index.map((entry) => entry.group))]
    expect(groups.indexOf('Sprzęt')).toBe(groups.indexOf('Rozwiązania') + 1)
    const provider = buildLineProvider(index)
    const titles = provider.query('wizsense').flatMap((group) => group.results.map((r) => r.title))
    expect(titles).toContain('Dahua WizSense 2 tubowa')
  })
})

describe('buildInstSearchIndex', () => {
  it('keeps the group order of the spec and drops repeated pages', () => {
    const index = buildInstSearchIndex(sources)
    expect([...new Set(index.map((entry) => entry.group))]).toEqual([
      'Usługi',
      'Dla kogo',
      'Rozwiązania',
      'Poradnik',
      'Realizacje',
      'Strony',
      'Pytania',
    ])
    expect(index.filter((entry) => entry.href === '/uslugi')).toHaveLength(1)
    expect(new Set(index.map((entry) => entry.id)).size).toBe(index.length)
  })

  it('finds a solution by its description and a question without Polish letters', () => {
    const provider = buildLineProvider(buildInstSearchIndex(sources))
    const titles = (q: string) =>
      provider.query(q).flatMap((group) => group.results.map((result) => result.title))
    expect(titles('syrena')).toContain('Kamera z odstraszaniem')
    expect(titles('internetu')).toContain('Czy kamery działają bez internetu?')
    expect(titles('pensjonat')).toContain('Pensjonat')
  })

  it('stays small: a solution text is clipped', () => {
    const long = 'słowo '.repeat(100)
    const [entry] = buildInstSearchIndex({
      ...sources,
      menu: { ...sources.menu, services: [], objects: [] },
      offer: [
        { name: 'X', href: '/x', solutions: [{ name: 'Y', description: long, categories: [] }] },
      ],
    })
    expect(entry?.text?.length).toBeLessThanOrEqual(161)
  })
})

describe('service icons in the search window (runda v6 §1.5)', () => {
  it('every service has its own icon of the shared set, not the same shield', () => {
    const keys = ['kam', 'alarm', 'kd', 'wifi', 'tel', 'ant', 'smart', 'snd', 'scr', 'ev']
    const icons = keys.map((key) => SERVICE_SEARCH_ICONS[key as keyof typeof SERVICE_SEARCH_ICONS])
    for (const icon of icons) expect(isIconName(icon), String(icon)).toBe(true)
    expect(new Set(icons).size).toBe(keys.length)
    expect(icons).not.toContain('shield')
  })
})
