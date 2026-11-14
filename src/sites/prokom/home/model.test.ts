import { describe, expect, it } from 'vitest'

import type { HubHelpView, HubPlanView, HubToolView } from '@/lib/prokom/data'
import type { HubLineContact } from '@/lib/prokom/lineContacts'

import { hubHome } from '../../../seed/prokom/map'
import {
  addressLine,
  choosePlans,
  faqItems,
  faqTokens,
  helpCases,
  homeLines,
  linesCount,
  teamExamples,
} from './model'

const contact = (key: HubLineContact['key'], promise: string | null): HubLineContact => ({
  key,
  name: key[0]!.toUpperCase() + key.slice(1),
  domain: `${key}.test`,
  url: `https://${key}.test`,
  phone: '111 222 333',
  email: null,
  hours: null,
  promise,
})

const tool = (key: string, line: HubToolView['line'], featuredOnHome: boolean): HubToolView => ({
  key,
  line,
  action: 'zglos',
  title: `Narzędzie ${key}`,
  desc: '',
  inputs: [],
  result: null,
  ctaLabel: null,
  url: null,
  badge: null,
  preview: null,
  featuredOnHome,
})

describe('homeLines', () => {
  const home = hubHome()

  it('fills the promise from the panel and drops a step without one', () => {
    const [biznes, software] = homeLines(
      [contact('biznes', 'Oddzwaniamy w godzinach pracy'), contact('software', null)],
      home,
      [],
      [],
    )
    expect(biznes?.scene.steps.map((step) => step.title)).toContain('Oddzwaniamy w godzinach pracy')
    expect(JSON.stringify(biznes?.scene)).not.toContain('{obietnica}')
    expect(software?.scene.steps).toHaveLength(2)
    expect(software?.scene.facts.some((fact) => fact.includes('{'))).toBe(false)
  })

  it('shows a fact-bound line fact only while the fact is approved', () => {
    const [hidden] = homeLines([contact('biznes', null)], home, [], [])
    expect(hidden?.scene.facts.some((fact) => fact.includes('Posnet'))).toBe(false)
    const facts = ['Posnet', 'Elzab'].map((value) => ({ value }))
    const [shown] = homeLines([contact('biznes', null)], home, [], facts)
    expect(shown?.scene.facts.some((fact) => fact.includes('Posnet'))).toBe(true)
  })

  it('takes the two home tools of the line, falling back to the line site', () => {
    const tools = [
      tool('a', 'tech', true),
      tool('b', 'biznes', false),
      tool('c', 'tech', true),
      tool('d', 'tech', true),
    ]
    const [tech] = homeLines([contact('tech', null)], home, tools, [])
    expect(tech?.tools).toEqual([
      { title: 'Narzędzie a', url: 'https://tech.test' },
      { title: 'Narzędzie c', url: 'https://tech.test' },
    ])
    expect(tech?.label).toBe('TECH')
  })
})

describe('teamExamples', () => {
  const plan: HubPlanView = {
    key: 'pensjonat',
    type: 'persona',
    name: 'Noclegi',
    title: 'Goście mają Wi-Fi',
    lead: null,
    groups: [
      { line: 'instalacje', points: ['Wi-Fi'] },
      { line: 'gaming', points: ['Zestaw'] },
    ],
    start: [],
    questions: [],
    steps: [],
    call: null,
  }

  it('keeps only lines shown on the page and skips a missing persona', () => {
    const examples = teamExamples(
      [
        { persona: 'pensjonat', tab: 'Pensjonat', node: 'Twój pensjonat' },
        { persona: 'nie-ma', tab: 'X', node: 'X' },
      ],
      [plan],
      ['instalacje', 'biznes'],
    )
    expect(examples).toHaveLength(1)
    expect(examples[0]?.cards.map((card) => card.line)).toEqual(['instalacje'])
    expect(examples[0]?.title).toBe('Goście mają Wi-Fi')
  })
})

describe('linesCount', () => {
  it('uses the Polish plural', () => {
    expect([1, 2, 4, 5, 12, 22].map(linesCount)).toEqual([
      '1 linia',
      '2 linie',
      '4 linie',
      '5 linii',
      '12 linii',
      '22 linie',
    ])
  })
})

const persona = (key: string, groups: HubPlanView['groups']): HubPlanView => ({
  key,
  type: 'persona',
  name: key,
  title: `Plan ${key}`,
  lead: null,
  groups,
  start: [],
  questions: [],
  steps: [],
  call: null,
})

describe('choosePlans', () => {
  const lines = homeLines([contact('biznes', null), contact('tech', null)], hubHome(), [], [])

  it('keeps the order of the texts and only the lines on the page', () => {
    const plans = [
      persona('dom', [{ line: 'gaming', points: ['x'] }]),
      persona('biuro', [
        { line: 'gaming', points: ['x'] },
        { line: 'tech', points: ['Naprawy'] },
        { line: 'biznes', points: ['Kasa'] },
      ]),
    ]
    const result = choosePlans(
      [
        { persona: 'biuro', sub: 'biuro' },
        { persona: 'dom', sub: null },
        { persona: 'brak', sub: null },
      ],
      plans,
      lines,
    )
    expect(result.map((row) => row.persona)).toEqual(['biuro'])
    expect(result[0]?.groups.map((group) => group.key)).toEqual(['tech', 'biznes'])
    expect(result[0]?.groups[0]?.url).toBe('https://tech.test')
  })
})

describe('helpCases', () => {
  const lines = homeLines([contact('tech', null)], hubHome(), [], [])
  const help = (slug: string, line: HubHelpView['line']): HubHelpView => ({
    slug,
    group: 'g',
    line,
    title: slug,
    steps: ['1', '2', '3', '4'],
    prep: [],
    ctaLabel: null,
    relatedTool: null,
    seoTitle: null,
    seoDescription: null,
  })

  it('follows the slugs, drops other lines and keeps three steps', () => {
    const result = helpCases(['b', 'a', 'x'], [help('a', 'tech'), help('b', 'biznes')], lines)
    expect(result.map((row) => row.slug)).toEqual(['a'])
    expect(result[0]?.steps).toHaveLength(3)
    expect(result[0]?.line.phone).toBe('111 222 333')
  })
})

describe('addressLine, faqTokens and faqItems', () => {
  const address = { street: 'ul. Testowa 1', postalCode: '00-001', city: 'Miasto' }
  const hours = [{ days: ['mon', 'tue', 'wed', 'thu', 'fri'], opens: '09:00', closes: '17:00' }]

  it('writes the address of the first location, or nothing without one', () => {
    expect(addressLine({ address })).toBe('ul. Testowa 1, 00-001 Miasto')
    expect(addressLine({ address: null })).toBeNull()
  })

  it('fills the tokens and leaves out an answer whose token has no value', () => {
    const items = [
      { question: 'Telefon?', answer: 'Zadzwoń: {telefon}.' },
      { question: 'Gdzie?', answer: '{adres}. {godziny}.' },
      { question: 'Firmy?', answer: 'Jedna firma.' },
    ]
    const full = faqItems(items, faqTokens({ address, hours }, '111 222 333'))
    expect(full.map((item) => item.answer)).toEqual([
      'Zadzwoń: 111 222 333.',
      expect.stringContaining('ul. Testowa 1, 00-001 Miasto.'),
      'Jedna firma.',
    ])
    const empty = faqItems(items, faqTokens({ address: null, hours: [] }, null))
    expect(empty.map((item) => item.question)).toEqual(['Firmy?'])
  })
})
