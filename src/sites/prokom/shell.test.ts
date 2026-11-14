import { describe, expect, it } from 'vitest'

import type { HubServiceView } from '@/lib/prokom/data'
import { NO_OPTIONAL_PAGES } from '@/lib/prokom/pages'
import type { SharedLine } from '@/lib/shared/project'

import {
  footerColumns,
  hubNav,
  liveLink,
  MEGA_SERVICES,
  megaLines,
  sheetLinks,
  startLinks,
} from './shell'

const line = (key: SharedLine['key'], name: string): SharedLine => ({
  key,
  name,
  kind: 'linia',
  order: 0,
  domain: `${key}.test`,
  url: `https://${key}.test`,
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

const LINES = [line('prokom', 'PRO-KOM'), line('biznes', 'Biznes'), line('tech', 'Tech')]

const service = (key: string, lineKey: HubServiceView['line'], title: string): HubServiceView => ({
  key,
  line: lineKey,
  title,
  short: 'krótko',
  long: null,
  audience: 'oba',
  includes: [],
  related: [],
  keywords: null,
  url: null,
  ctaLabel: null,
})

describe('hub menu (spec §5.2)', () => {
  it('hides pages of v1.1 until they are switched on', () => {
    expect(hubNav(NO_OPTIONAL_PAGES).map((item) => item.label)).toEqual([
      'Dla firm',
      'Inwestycje i dostawy',
      'O firmie',
      'Kontakt',
    ])
    const all = hubNav({ ...NO_OPTIONAL_PAGES, forHome: true, online: true, help: true })
    expect(all.map((item) => item.href)).toEqual([
      '/dla-firm',
      '/dla-domu',
      '/inwestycje-i-dostawy',
      '/zalatw-online',
      '/pomoc',
      '/o-firmie',
      '/kontakt',
    ])
  })

  it('„Zacznij od siebie” and the sheet follow the same switches', () => {
    expect(startLinks(NO_OPTIONAL_PAGES).map((link) => link.href)).toEqual([
      '/dla-firm',
      '/inwestycje-i-dostawy',
    ])
    expect(sheetLinks(NO_OPTIONAL_PAGES).map((link) => link.href)).toEqual([
      '/dla-firm',
      '/inwestycje-i-dostawy',
      '/o-firmie',
      '/kontakt',
    ])
  })
})

describe('„Oferta” mega menu', () => {
  const services = [
    ...Array.from({ length: 8 }, (_, i) => service(`b${i}`, 'biznes', `Kasy fiskalne ${i}`)),
    service('t1', 'tech', 'Telefony i tablety'),
  ]

  it('shows the lines of CompanyData without the hub itself, 6 services each and the count', () => {
    const mega = megaLines(LINES, services)
    expect(mega.map((entry) => entry.key)).toEqual(['biznes', 'tech'])
    expect(mega[0]?.services).toHaveLength(MEGA_SERVICES)
    expect(mega[0]?.count).toBe(8)
    expect(mega[1]?.services[0]?.icon).toBe('mobile')
  })

  it('leaves out an unpublished line (Gaming before its start) — it is not in the shared lines', () => {
    expect(megaLines(LINES, [service('g1', 'gaming', 'Gotowe zestawy')])).toHaveLength(2)
  })
})

describe('footer columns (spec §5.5)', () => {
  it('starts with „Cała oferta” from the lines and drops links to pages that are off', () => {
    const columns = footerColumns(
      LINES,
      [
        {
          heading: 'Firma',
          links: [
            { label: 'O firmie', href: '/o-firmie' },
            { label: 'Partnerzy', href: '/partnerzy' },
          ],
        },
        { heading: 'Pusta', links: [{ label: 'Pomoc', href: '/pomoc' }] },
      ],
      NO_OPTIONAL_PAGES,
    )
    expect(columns.map((column) => column.heading)).toEqual(['Cała oferta', 'Firma'])
    expect(columns[0]?.links.map((link) => link.label)).toEqual(['PRO-KOM Biznes', 'PRO-KOM Tech'])
    expect(columns[1]?.links.map((link) => link.href)).toEqual(['/o-firmie'])
  })
})

describe('liveLink', () => {
  it('drops a tab bar link to a page that is off (Załatw before /zalatw-online exists)', () => {
    expect(liveLink({ label: 'Załatw', href: '/zalatw-online' }, NO_OPTIONAL_PAGES)).toBeNull()
    expect(liveLink({ label: 'Dobierz', href: '/#dobierz' }, NO_OPTIONAL_PAGES)).not.toBeNull()
  })
})
