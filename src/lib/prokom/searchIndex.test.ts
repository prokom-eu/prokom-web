import { gzipSync } from 'node:zlib'

import { describe, expect, it } from 'vitest'

import { PROKOM_SHARED } from '@/seed/shared/prokom'
import { hubHelp, hubServices, hubTools } from '@/seed/prokom/map'
import type { SharedLine } from '@/lib/shared/project'

import type { HubHelpView, HubServiceView, HubToolView } from './data'
import { NO_OPTIONAL_PAGES } from './pages'
import { buildHubSearchIndex, parseFilter, searchHub, suggestHub } from './searchIndex'

const line = (key: SharedLine['key'], name: string, domain: string): SharedLine => ({
  key,
  name,
  kind: 'linia',
  order: 0,
  domain,
  url: `https://${domain}`,
  logoLabel: null,
  color: null,
  colorOnDark: null,
  description: `Opis ${name}`,
  descriptionLong: null,
  phone: null,
  email: null,
  hours: null,
  promise: null,
})

// Published lines today: Gaming waits for its start (CompanyData).
const LINES = [
  line('prokom', 'PRO-KOM', 'pro-kom.eu'),
  line('biznes', 'Biznes', 'prokombiznes.pl'),
  line('instalacje', 'Instalacje', 'prokominstalacje.pl'),
  line('software', 'Software', 'prokomsoftware.pl'),
  line('tech', 'Tech', 'prokomserwis.pl'),
]

const services: HubServiceView[] = hubServices().map((s) => ({
  key: s.key,
  line: s.line,
  title: s.title,
  short: s.short,
  long: s.long ?? null,
  audience: s.audience,
  includes: s.includes ?? [],
  related: s.relatedKeys,
  keywords: s.keywords ?? null,
  url: s.url ?? null,
  ctaLabel: s.ctaLabel ?? null,
}))
const tools: HubToolView[] = hubTools().map((t) => ({
  key: t.key,
  line: t.line,
  action: t.action,
  title: t.title,
  desc: t.desc,
  inputs: t.inputs ?? [],
  result: t.result ?? null,
  ctaLabel: t.ctaLabel ?? null,
  url: t.url ?? null,
  badge: t.badge ?? null,
  preview: null,
  featuredOnHome: Boolean(t.featuredOnHome),
}))
const help: HubHelpView[] = hubHelp().map((h) => ({
  slug: h.slug,
  group: h.group,
  line: h.line,
  title: h.title,
  steps: h.steps ?? [],
  prep: h.prep ?? [],
  ctaLabel: h.ctaLabel ?? null,
  relatedTool: null,
  seoTitle: null,
  seoDescription: null,
}))

const index = buildHubSearchIndex({ lines: LINES, services, tools, help, flags: NO_OPTIONAL_PAGES })
const synonyms = PROKOM_SHARED.rail?.synonyms ?? []
const count = (kind: string) => index.filter((entry) => entry.kind === kind).length

describe('hub search index (ADR-H002 §4)', () => {
  it('has the published lines, their services, tools and help, and the pages that are on', () => {
    // Gaming is unpublished: its 8 services, 4 tools and 2 situations wait with it.
    expect(count('line')).toBe(4)
    expect(count('service')).toBe(41)
    expect(count('tool')).toBe(16)
    expect(count('help')).toBe(24)
    expect(index.filter((e) => e.kind === 'page').map((e) => e.href)).toEqual([
      '/dla-firm',
      '/inwestycje-i-dostawy',
      '/linie',
      '/o-firmie',
      '/kontakt',
    ])
  })

  it('never links to a page of v1.1 that is off', () => {
    const off = ['/dla-domu', '/zalatw-online', '/pomoc', '/wspolpraca', '/partnerzy']
    for (const entry of index) {
      for (const path of off) expect(entry.href.startsWith(path), entry.id).toBe(false)
    }
    // i10 leads to /wspolpraca in the panel — while it is off, to the Instalacje site.
    expect(index.find((e) => e.id === 'service-i10')?.href).toBe('https://prokominstalacje.pl')
    expect(index.find((e) => e.id === 'service-b11')?.href).toBe('/inwestycje-i-dostawy')
  })

  it('links help to its page once /pomoc is on', () => {
    const on = buildHubSearchIndex({
      lines: LINES,
      services,
      tools,
      help,
      flags: { ...NO_OPTIONAL_PAGES, help: true },
    })
    expect(on.find((e) => e.kind === 'help')?.href).toMatch(/^\/pomoc\/[a-z0-9-]+$/)
  })

  it('a tool leads to its deep link, or without one to contact with its name as the phrase', () => {
    const tools = index.filter((e) => e.kind === 'tool')
    expect(tools.find((e) => e.title === 'Zaplanuj instalację')?.href).toBe(
      'https://prokominstalacje.pl/zaplanuj',
    )
    expect(tools.find((e) => e.title === 'Status naprawy')?.href).toMatch(/^\/kontakt\?fraza=/)
  })

  it('stays under 50 KB gzip (the window fetches it once)', () => {
    expect(gzipSync(JSON.stringify(index)).length).toBeLessThan(50_000)
  })
})

describe('searchHub — /szukaj (spec §5.6)', () => {
  it('„kamery” finds the Instalacje monitoring as the best hit', () => {
    const page = searchHub(index, 'kamery', 'wszystko', synonyms)
    expect(page.best?.title).toBe('Monitoring i kamery')
    expect(page.best?.line).toBe('instalacje')
    expect(page.counts.instalacje).toBeGreaterThan(0)
  })

  it('works without Polish letters and through synonyms', () => {
    expect(searchHub(index, 'peknięty ekran', 'wszystko', synonyms).total).toBeGreaterThan(0)
    expect(searchHub(index, 'CCTV', 'wszystko', synonyms).best?.line).toBe('instalacje')
  })

  it('a line filter keeps only that line; counts stay for every tab', () => {
    const all = searchHub(index, 'serwis', 'wszystko', synonyms)
    const tech = searchHub(index, 'serwis', 'tech', synonyms)
    expect(tech.total).toBe(all.counts.tech)
    expect(tech.groups.flatMap((g) => g.results).every((hit) => hit.line === 'tech')).toBe(true)
    expect(tech.counts).toEqual(all.counts)
  })

  it('groups follow the board: services (max 12) before tools, help and pages', () => {
    const page = searchHub(index, 'kasa', 'wszystko', synonyms)
    expect(page.groups[0]?.kind).toBe('service')
    for (const group of page.groups) {
      expect(group.results.length).toBeLessThanOrEqual(group.kind === 'service' ? 12 : 6)
    }
    expect(page.groups.flatMap((g) => g.results)).not.toContain(page.best)
  })

  it('nothing found → no best hit, no groups', () => {
    const page = searchHub(index, 'zzqqxx', 'wszystko', synonyms)
    expect(page).toMatchObject({ total: 0, best: null, groups: [] })
  })

  it('reads only known filters from the address', () => {
    expect(parseFilter('tech')).toBe('tech')
    expect(parseFilter('strony')).toBe('strony')
    expect(parseFilter('prokom')).toBe('wszystko')
    expect(parseFilter(undefined)).toBe('wszystko')
  })
})

describe('suggestHub — hero suggestions (15.11)', () => {
  it('gives the hits of the whole phrase, best first, at most six', () => {
    const { results, loose } = suggestHub(index, 'kamery', synonyms)
    expect(loose).toBe(false)
    expect(results[0]?.title).toBe('Monitoring i kamery')
    expect(results.length).toBeLessThanOrEqual(6)
  })

  it('falls back to the words of a phrase that finds nothing as a whole', () => {
    expect(searchHub(index, 'kamery zzqqxx', 'wszystko', synonyms).total).toBe(0)
    const { results, loose } = suggestHub(index, 'kamery zzqqxx', synonyms)
    expect(loose).toBe(true)
    expect(results[0]?.title).toBe('Monitoring i kamery')
  })

  it('tops up a phrase with few hits from its words', () => {
    const whole = searchHub(index, 'kamery do pensjonatu', 'wszystko', synonyms).total
    const { results, loose } = suggestHub(index, 'kamery do pensjonatu', synonyms)
    expect(loose).toBe(false)
    expect(results.length).toBeGreaterThan(whole)
    expect(results[0]?.title).toBe('Monitoring i kamery')
  })

  it('finds nothing for nonsense, and does not fall back on one word', () => {
    expect(suggestHub(index, 'zzqqxx', synonyms)).toEqual({ results: [], loose: false })
  })
})
