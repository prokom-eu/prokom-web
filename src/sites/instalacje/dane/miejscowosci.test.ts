import { describe, expect, it } from 'vitest'

import { AREA_TOWNS } from '@/lib/instalacje/area'
import { SERVICE_KEYS } from '@/lib/instalacje/options'
import { AREA_SERVED } from '@/lib/instalacje/seo'
import { TITLE_SUFFIX, townRealizations, townTitle } from '@/lib/instalacje/townPage'

import { TOWNS, townPage, townText } from './miejscowosci'

const nameOf = (slug: string) => AREA_TOWNS.find((t) => t.slug === slug)?.name ?? ''

/**
 * Every sentence of four words or more a town page writes on its own (the shared `townPage` texts
 * aside; „Tak.” may open many answers).
 */
function sentencesOf(town: (typeof TOWNS)[number]): string[] {
  const texts = [
    town.summary,
    town.description,
    town.lead,
    town.route,
    ...town.traits.flatMap((t) => [t.title, t.text]),
    ...town.services.map((s) => s.text),
    ...town.faq.flatMap((f) => [f.question, f.answer]),
  ]
  return texts
    .flatMap((text) => text.split(/(?<=[.?!])\s+/))
    .map((s) => s.trim().toLowerCase())
    .filter((s) => s.split(/\s+/).length >= 4)
}

describe('town pages (ADR-I006)', () => {
  it('has a text for every town of the list, in its order, and nothing else', () => {
    expect(TOWNS.map((t) => t.slug)).toEqual(AREA_TOWNS.map((t) => t.slug))
  })

  it('repeats no sentence between towns (no doorway pages)', () => {
    const seen = new Map<string, string>()
    const repeated: string[] = []
    for (const town of TOWNS) {
      for (const sentence of new Set(sentencesOf(town))) {
        const other = seen.get(sentence)
        if (other && other !== town.slug) repeated.push(`${town.slug} = ${other}: ${sentence}`)
        seen.set(sentence, town.slug)
      }
    }
    expect(repeated).toEqual([])
  })

  it('names the town in its lead, description and every FAQ question', () => {
    for (const town of TOWNS) {
      const stem = nameOf(town.slug).split(/[ -]/)[0]!.slice(0, 3)
      expect(town.lead, town.slug).toContain(stem)
      expect(town.description, town.slug).toContain(stem)
      for (const { question } of town.faq) expect(question, town.slug).toContain(stem)
    }
  })

  it('keeps titles within 60 characters with the site name and descriptions within 160', () => {
    for (const town of TOWNS) {
      const title = townTitle(nameOf(town.slug))
      expect((title + TITLE_SUFFIX).length, title).toBeLessThanOrEqual(60)
      expect(title, town.slug).toContain(nameOf(town.slug))
      expect(title, town.slug).toContain('monitoring')
      expect(town.description.length, town.slug).toBeLessThanOrEqual(160)
      expect(town.description.length, town.slug).toBeGreaterThanOrEqual(110)
    }
    expect(townTitle('Pcim')).toBe('Instalacje Pcim: monitoring, alarmy')
    expect(townTitle('Rabka-Zdrój')).toBe('Instalacje Rabka-Zdrój: monitoring')
    expect(townTitle('Bukowina Tatrzańska')).toBe('Bukowina Tatrzańska: monitoring')
  })

  it('has three features, three questions and at least four distinct, known services', () => {
    const keys = new Set<string>(SERVICE_KEYS.map(({ value }) => value))
    for (const town of TOWNS) {
      expect(town.traits, town.slug).toHaveLength(3)
      expect(town.faq, town.slug).toHaveLength(3)
      expect(town.services.length, town.slug).toBeGreaterThanOrEqual(4)
      const own = town.services.map((s) => s.key)
      expect(new Set(own).size, town.slug).toBe(own.length)
      for (const key of own) expect(keys.has(key), `${town.slug}: ${key}`).toBe(true)
    }
  })

  it('has a page for every town of `areaServed` and no page outside it', () => {
    expect([...AREA_TOWNS.map((t) => t.name)].sort()).toEqual([...AREA_SERVED].sort())
  })

  it('links only to other towns with a page', () => {
    for (const town of TOWNS) {
      expect(town.nearby.length, town.slug).toBeGreaterThanOrEqual(3)
      expect(town.nearby, town.slug).not.toContain(town.slug)
      for (const slug of town.nearby) expect(townText(slug), slug).not.toBeNull()
    }
  })

  it('keeps the line rules: no prices, „24 h” only as the answer to a report (spec §2)', () => {
    const all = [...TOWNS.flatMap(sentencesOf), townPage.cta.text.toLowerCase()]
    for (const sentence of all) {
      expect(sentence).not.toMatch(/\bzł\b|pln|cen[ay] od|od \d+ ?zł/)
      if (sentence.includes('24 h')) expect(sentence).toMatch(/odpowiadamy do 24 h/)
      expect(sentence).not.toMatch(/whatsapp/)
    }
  })

  it('puts the towns beyond the everyday zone on „travel agreed one by one”', () => {
    for (const town of TOWNS.filter((t) => t.zone === 'dalej')) {
      expect(town.route, town.slug).toMatch(/indywidualnie|ustalamy|większych/)
    }
  })
})

describe('townRealizations', () => {
  const list = [
    { id: 1, place: 'Rabka-Zdrój i Ponice · firma: sale i biuro' },
    { id: 2, place: 'Zakopane i Kraków · salony sprzedaży' },
    { id: 3, place: 'Kraków · lokal usługowy' },
    { id: 4, place: 'Nowy Sącz · kawiarnia' },
    { id: 5, place: null },
  ]

  it('matches the town by whole names before „·”', () => {
    expect(townRealizations(list, ['Kraków']).map((r) => r.id)).toEqual([2, 3])
    expect(townRealizations(list, ['Rabka-Zdrój', 'Ponice']).map((r) => r.id)).toEqual([1])
    expect(townRealizations(list, ['Poronin'])).toEqual([])
    expect(townRealizations(list, ['Nowy Targ'])).toEqual([])
  })
})

describe('withAreaLink', () => {
  it('adds „Obszar działania” to the last panel column once, or a column without any', async () => {
    const { withAreaLink, AREA_FOOTER_LINK } = await import('../obszar/areaFooter')
    const columns = [
      { heading: 'Usługi', links: [{ label: 'Monitoring', href: '/monitoring' }] },
      { heading: 'Firma', links: [{ label: 'O firmie', href: '/o-firmie' }] },
    ]
    const out = withAreaLink(columns)
    expect(out).toHaveLength(2)
    expect(out[0]).toEqual(columns[0])
    expect(out[1]?.links.at(-1)).toEqual({ label: 'Obszar działania', href: '/obszar' })
    expect(withAreaLink(out)).toEqual(out)
    expect(withAreaLink([])).toEqual([{ heading: 'Obszar działania', links: [AREA_FOOTER_LINK] }])
  })
})
