import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import type { SharedLine } from '@/lib/shared/project'

import { LegalBar } from './LegalBar'
import { LinesBand } from './LinesBand'
import { SiteFooter, type SiteFooterProps } from './SiteFooter'

const line = (key: SharedLine['key'], name: string, url: string | null = `https://${key}.test`) =>
  ({
    key,
    name,
    kind: key === 'gaming' ? 'marka' : 'linia',
    order: 0,
    domain: url ? `${key}.test` : null,
    url,
    logoLabel: null,
    color: '#244FB0',
    colorOnDark: null,
    description: `Opis ${name}`,
    descriptionLong: null,
  }) satisfies SharedLine

const FIVE = [
  line('prokom', 'PRO-KOM'),
  line('biznes', 'Biznes'),
  line('instalacje', 'Instalacje'),
  line('software', 'Software'),
  line('tech', 'Tech'),
]

const company: SiteFooterProps['company'] = {
  name: 'PRO-KOM Tadeusz Wójciak',
  nip: '7352511447',
  address: { street: 'ul. Orkana 16B', postalCode: '34-700', city: 'Rabka-Zdrój' },
  legal: {
    privacy: '/polityka-prywatnosci',
    cookies: '/cookies',
    accessibility: '/dostepnosc',
    sitemap: '/mapa-strony',
  },
  mapsUrl: 'https://www.google.com/maps/dir/?api=1&destination=Orkana',
}

const html = (element: Parameters<typeof renderToStaticMarkup>[0]) => renderToStaticMarkup(element)

describe('LegalBar (spec §5)', () => {
  const legalLine = (markup: string) =>
    /data-legal-line="">([^<]*(?:<!-- -->[^<]*)*)</.exec(markup)?.[1]

  it('the same company line for every line; only the note differs', () => {
    const a = html(createElement(LegalBar, { company, year: 2026, legalNote: 'Oferta dla firm' }))
    const b = html(createElement(LegalBar, { company, year: 2026, legalNote: null }))
    expect(legalLine(a)).toBe(legalLine(b))
    expect(a.replace(/<!-- -->/g, '')).toContain(
      '© 2026 PRO-KOM Tadeusz Wójciak · ul. Orkana 16B, 34-700 Rabka-Zdrój · NIP 7352511447',
    )
    expect(a).toContain('Oferta dla firm')
    expect(b).not.toContain('Oferta dla firm')
  })

  it('four legal links from CompanyData.legal in a fixed order, then „Do góry”', () => {
    const markup = html(createElement(LegalBar, { company, year: 2026 }))
    const hrefs = [...markup.matchAll(/href="([^"]+)"/g)].map((m) => m[1])
    expect(hrefs).toEqual(['/polityka-prywatnosci', '/cookies', '/dostepnosc', '/mapa-strony', '#'])
  })

  it('the line’s own legal pages go right after the privacy policy (Software: Regulamin)', () => {
    const extraLinks = [{ label: 'Regulamin', href: '/regulamin' }]
    const markup = html(createElement(LegalBar, { company, year: 2026, extraLinks }))
    const hrefs = [...markup.matchAll(/href="([^"]+)"/g)].map((m) => m[1])
    expect(hrefs.slice(0, 3)).toEqual(['/polityka-prywatnosci', '/regulamin', '/cookies'])
  })
})

describe('LinesBand (spec §5, §2.4)', () => {
  const tiles = (markup: string) => markup.match(/data-line-tile=/g)?.length ?? 0

  it('5 tiles while Gaming is unpublished, 6 once it is — Gaming last', () => {
    expect(tiles(html(createElement(LinesBand, { lines: FIVE, current: 'biznes' })))).toBe(5)
    const six = html(
      createElement(LinesBand, { lines: [line('gaming', 'Gaming'), ...FIVE], current: 'biznes' }),
    )
    expect(tiles(six)).toBe(6)
    expect(six.lastIndexOf('data-line-tile="gaming"')).toBeGreaterThan(
      six.indexOf('data-line-tile="tech"'),
    )
  })

  it('marks the current line with aria-current and „Jesteś tutaj”', () => {
    const markup = html(createElement(LinesBand, { lines: FIVE, current: 'software' }))
    expect(markup.match(/aria-current="page"/g)).toHaveLength(1)
    expect(markup).toMatch(/href="https:\/\/software\.test" aria-current="page"/)
    expect(markup.match(/Jesteś tutaj/g)).toHaveLength(1)
  })

  it('has as many columns as lines — no empty sixth slot while Gaming waits', () => {
    expect(html(createElement(LinesBand, { lines: FIVE, current: 'biznes' }))).toContain('--n:5')
  })

  it('a line without an address is a tile, not a link without href', () => {
    const markup = html(
      createElement(LinesBand, { lines: [line('tech', 'Tech', null)], current: 'biznes' }),
    )
    expect(markup).not.toContain('<a')
  })
})

describe('SiteFooter (spec §5)', () => {
  const props: SiteFooterProps = {
    line: 'instalacje',
    lineName: 'PRO-KOM Instalacje',
    description: 'Monitoring, sieci i smart home na Podhalu.',
    promises: ['Gwarancja 24 mies. na montaż'],
    columns: [{ heading: 'Usługi', links: [{ label: 'Monitoring', href: '/uslugi/monitoring' }] }],
    company,
    contact: {
      phone: '889 003 889',
      email: 'kontakt@prokominstalacje.pl',
      hours: [{ days: ['mon'], opens: '09:00', closes: '17:00' }],
      holidays: [],
      responsePromise: 'Odpowiedź do 24 h w dni robocze',
    },
    lines: FIVE,
    legalNote: null,
    now: '2026-11-09T09:00:00Z',
  }

  it('contact column from the data: tel, mailto, the route = mapsUrl, the status', () => {
    const markup = html(createElement(SiteFooter, props))
    expect(markup).toContain('href="tel:+48889003889"')
    expect(markup).toContain('href="mailto:kontakt@prokominstalacje.pl"')
    expect(markup).toMatch(
      /href="https:\/\/www\.google\.com\/maps\/dir\/\?api=1&amp;destination=Orkana"[^>]*data-route/,
    )
    expect(markup).toContain('Otwarte · do 17:00')
    expect(markup).toContain('OpenStreetMap contributors')
  })

  it('the line columns twice — desktop list and phone accordion — with the band and legal bar', () => {
    const markup = html(createElement(SiteFooter, props))
    expect(markup.match(/href="\/uslugi\/monitoring"/g)).toHaveLength(2)
    expect(markup).toContain('<details')
    expect(markup).toContain('data-lines-band')
    expect(markup).toContain('data-legal-bar')
    expect(markup.replace(/<!-- -->/g, '')).toContain('© 2026 PRO-KOM Tadeusz Wójciak')
  })

  it('leaves out a column without a heading or links (unfinished in the panel)', () => {
    const markup = html(
      createElement(SiteFooter, {
        ...props,
        columns: [
          ...props.columns,
          { heading: '', links: [{ label: 'X', href: '/x' }] },
          { heading: 'Pusta', links: [] },
        ],
      }),
    )
    expect(markup).not.toContain('href="/x"')
    expect(markup).not.toContain('Pusta')
    expect(markup).toContain('--cols:1')
  })

  it('without a phone or e-mail leaves them out (no literal fallback)', () => {
    const markup = html(
      createElement(SiteFooter, {
        ...props,
        contact: { ...props.contact, phone: null, email: null },
      }),
    )
    expect(markup).not.toContain('tel:')
    expect(markup).not.toContain('mailto:')
  })
})
