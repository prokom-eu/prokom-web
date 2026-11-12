import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import type { SharedLine } from '@/lib/shared/project'

import { BrandBar, type BrandBarProps } from './BrandBar'

const line = (key: SharedLine['key'], name: string, order: number): SharedLine => ({
  key,
  name,
  kind: key === 'gaming' ? 'marka' : 'linia',
  order,
  domain: `${key}.test`,
  url: `https://${key}.test`,
  logoLabel: null,
  color: '#244FB0',
  colorOnDark: null,
  description: null,
  descriptionLong: null,
})

const props: BrandBarProps = {
  // Gaming first on purpose: the bar puts it last whatever the panel order.
  lines: [line('gaming', 'Gaming', 0), line('prokom', 'PRO-KOM', 1), line('biznes', 'Biznes', 2)],
  current: 'biznes',
  hours: [{ days: ['mon', 'tue', 'wed', 'thu', 'fri'], opens: '09:00', closes: '17:00' }],
  holidays: [],
  now: '2026-11-09T09:00:00Z',
  slot: { label: 'Konfigurator', href: '/konfigurator' },
  phone: '889 003 889',
  phoneLabel: 'Biznes:',
}

const render = (overrides: Partial<BrandBarProps> = {}) =>
  renderToStaticMarkup(createElement(BrandBar, { ...props, ...overrides }))

describe('BrandBar (spec §5)', () => {
  it('lists the given lines in order, Gaming last, in a labelled nav', () => {
    const html = render()
    expect(html).toContain('<nav aria-label="Linie PRO-KOM"')
    const names = [...html.matchAll(/<\/i>([^<]+)<\/a>/g)].map((m) => m[1])
    expect(names).toEqual(['PRO-KOM', 'Biznes', 'Gaming'])
  })

  it('marks only the current line with aria-current', () => {
    const html = render()
    expect(html.match(/aria-current="page"/g)).toHaveLength(1)
    expect(html).toMatch(/href="https:\/\/biznes\.test" aria-current="page"/)
  })

  it('shows the status for the server time, the line slot and the phone from the data', () => {
    const html = render()
    expect(html).toContain('Otwarte · do 17:00')
    expect(html).toContain('href="/konfigurator"')
    expect(html).toContain('href="tel:+48889003889"')
    expect(html).toContain('Biznes: <b')
  })

  it('the status, slot and phone sit in a named region landmark (audit 08.11 §2 pkt 7)', () => {
    const html = render()
    const region =
      /<section aria-label="Godziny otwarcia i kontakt"[^>]*>([\s\S]*?)<\/section>/.exec(
        html,
      )?.[1] ?? ''
    expect(region).toContain('Otwarte · do 17:00')
    expect(region).toContain('href="/konfigurator"')
    expect(region).toContain('href="tel:+48889003889"')
  })

  it('a line without an address is a label, not a link without href', () => {
    const html = render({ lines: [{ ...line('biznes', 'Biznes', 1), url: null }] })
    const nav = /<nav aria-label="Linie PRO-KOM"[^>]*>([\s\S]*?)<\/nav>/.exec(html)?.[1] ?? ''
    expect(nav).not.toContain('<a')
    expect(nav).toMatch(/^<span[^>]*aria-current="page"/)
  })

  it('without a phone or slot leaves them out (no literal fallback)', () => {
    const html = render({ phone: null, slot: null })
    expect(html).not.toContain('tel:')
    expect(html).not.toContain('Konfigurator')
  })
})
