import { renderToStaticMarkup } from 'react-dom/server'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import type { BzFactsBlock as BzFactsBlockData } from '@/payload-types'

const settings = vi.hoisted(() => ({ showOwnerQuote: false }))

vi.mock('@/lib/site/data', () => ({
  getSiteSettings: async () => ({ biznes: { showOwnerQuote: settings.showOwnerQuote } }),
}))

const { BzFactsBlock } = await import('./Component')

const block = {
  blockType: 'bzFacts',
  heading: 'Od 2004 roku przy kasach i komputerach firm z Podhala',
  headingAccent: 'przy kasach i komputerach firm',
  lead: 'Sprzedajemy, wdrażamy i serwisujemy w Rabce-Zdroju.',
  owner: {
    label: 'Słowo od właściciela',
    quote: 'Nie chodzi nam o to, żeby sprzedać jak najwięcej.',
    name: 'Tadeusz Wójciak',
    year: '2004',
  },
  stats: [{ value: '2004', label: 'rok założenia' }],
  contactLink: { label: 'Poznaj PRO-KOM', href: '/o-firmie' },
} as BzFactsBlockData

const render = async () => renderToStaticMarkup(await BzFactsBlock({ block, tenantId: 1 }))

describe('BzFactsBlock: the owner quote waits for approval (audit 01.11.2026)', () => {
  beforeEach(() => {
    settings.showOwnerQuote = false
  })

  it('without the setting shows the card: visible H2, lead, numbers, link — no quote', async () => {
    const html = await render()
    expect(html).not.toContain('<blockquote')
    expect(html).not.toContain('Tadeusz Wójciak')
    // POPRAWKI-0311 §C: the heading is seen, its accent in the accent colour.
    expect(html).toMatch(/<h2 id="fakty-h" class="(?![^"]*sr-only)[^"]*">Od 2004 roku <em/)
    expect(html).toContain('>przy kasach i komputerach firm</em>')
    expect(html).toContain('Sprzedajemy, wdrażamy i serwisujemy w Rabce-Zdroju.')
    expect(html).toContain('rok założenia')
    expect(html).toContain('href="/o-firmie"')
  })

  it('with the setting shows the quote with its author in two columns', async () => {
    settings.showOwnerQuote = true
    const html = await render()
    expect(html).toContain('<figure>')
    expect(html).toContain('<blockquote')
    expect(html).toContain('<figcaption')
    expect(html).toContain('Tadeusz Wójciak')
    expect(html).toContain('min-[900px]:grid-cols-')
    expect(html).toContain('>Słowo od właściciela</h2>')
  })
})
