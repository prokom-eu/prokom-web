import { describe, expect, it } from 'vitest'

import type { HubPlanView, HubToolView } from '@/lib/prokom/data'
import type { HubLineContact } from '@/lib/prokom/lineContacts'

import { hubHome } from '../../../seed/prokom/map'
import { homeLines, teamExamples } from './model'

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
