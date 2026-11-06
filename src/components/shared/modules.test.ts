import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import { FaqBlock } from './FaqBlock'
import { RulesBento } from './RulesBento'
import { StatsStrip, visibleStats } from './StatsStrip'
import { Steps } from './Steps'
import { VerifyCards } from './VerifyCards'

const html = (element: Parameters<typeof renderToStaticMarkup>[0]) => renderToStaticMarkup(element)

// D2-3b (plan F3 pkt 3, spec §6.2): the modules of the Kontakt and O firmie templates.
describe('StatsStrip — a flagged number never on production (D1 condition for D2)', () => {
  const stats = [
    { value: '2004', label: 'na Podhalu, w Rabce-Zdroju' },
    { value: '100+', label: 'klientów firmowych', flag: 'do potwierdzenia przez szefa' },
    { value: '5', label: 'linii w jednej firmie' },
  ]

  it('production: the flagged number is left out', () => {
    expect(visibleStats(stats, 'production').map((s) => s.value)).toEqual(['2004', '5'])
    const markup = html(createElement(StatsStrip, { stats, siteEnv: 'production' }))
    expect(markup).not.toContain('100+')
    expect(markup).not.toContain('data-stat-flag')
  })

  it('staging and local: the number shows with its badge', () => {
    const markup = html(createElement(StatsStrip, { stats, siteEnv: 'staging' }))
    expect(markup).toContain('100+')
    expect(markup).toContain('do potwierdzenia przez szefa')
  })
})

describe('RulesBento — 6 to 8 rules (ADR-022 D2-3b)', () => {
  const rules = (n: number) =>
    Array.from({ length: n }, (_, i) => ({ title: `Zasada ${i + 1}`, text: `Opis ${i + 1}` }))
  const titles = (markup: string) =>
    [...markup.matchAll(/<b[^>]*>(Zasada \d+)<\/b>/g)].map((m) => m[1])

  it('shows every rule up to eight, in order', () => {
    expect(titles(html(createElement(RulesBento, { rules: rules(6) })))).toHaveLength(6)
    expect(titles(html(createElement(RulesBento, { rules: rules(8) })))).toHaveLength(8)
    expect(titles(html(createElement(RulesBento, { rules: rules(9) })))).toHaveLength(8)
  })

  it('numbers them 01… and puts the last one on the dark bar', () => {
    const markup = html(createElement(RulesBento, { rules: rules(6) }))
    expect(markup).toContain('>06<')
    expect(markup.lastIndexOf('bg-line-dark')).toBeGreaterThan(markup.indexOf('Zasada 5'))
  })
})

describe('FaqBlock', () => {
  const items = [
    { question: 'Czy jest parking?', answer: 'Tak, przy salonie.' },
    { question: 'Pytanie bez odpowiedzi', answer: null },
  ]

  it('shows answered questions only, the first open, with FAQPage data', () => {
    const markup = html(createElement(FaqBlock, { title: 'Zanim zadzwonisz', items }))
    expect(markup).toContain('Czy jest parking?')
    expect(markup).not.toContain('Pytanie bez odpowiedzi')
    expect(markup).toMatch(/<details open=""/)
    expect(markup).toContain('"@type":"FAQPage"')
  })

  it('renders nothing when no question has an answer', () => {
    expect(html(createElement(FaqBlock, { title: 'X', items: [items[1]!] }))).toBe('')
  })
})

describe('Steps and VerifyCards', () => {
  it('Steps is an ordered list numbered 01…', () => {
    const markup = html(
      createElement(Steps, { steps: [{ title: 'Rozmowa' }, { title: 'Wycena' }] }),
    )
    expect(markup.startsWith('<ol')).toBe(true)
    expect(markup).toContain('>01<')
    expect(markup).toContain('>02<')
  })

  it('VerifyCards opens a source in a new tab; a card without one is not a link', () => {
    const markup = html(
      createElement(VerifyCards, {
        items: [
          { title: 'CEIDG', text: 'Po NIP', href: 'https://www.biznes.gov.pl/' },
          { title: 'Lista serwisów', text: 'Wkrótce' },
        ],
      }),
    )
    expect(markup.match(/<a /g)).toHaveLength(1)
    expect(markup).toContain('target="_blank" rel="noopener"')
  })
})
