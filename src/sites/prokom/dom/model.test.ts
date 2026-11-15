import { describe, expect, it } from 'vitest'

import type { HubPlanView } from '@/lib/prokom/data'

import { hubForHome } from '../../../seed/prokom/map'
import type { BusinessLineInfo } from '../firmy/model'
import { homeExamples, homeSituations, sceneAreas } from './model'

const line = (key: BusinessLineInfo['key']): BusinessLineInfo => ({
  key,
  name: key,
  label: key.toUpperCase(),
  domain: `${key}.test`,
  url: `https://${key}.test`,
  phone: '111 222 333',
  tel: 'tel:+48111222333',
  promise: 'Szybko',
})

const situation = (key: string, call: HubPlanView['call'], groups: HubPlanView['groups']) =>
  ({
    key,
    type: 'sytuacja-dom',
    name: key,
    title: `Tytuł ${key}`,
    lead: 'Wstęp',
    groups,
    start: [],
    questions: [],
    steps: ['Krok 1', 'Krok 2'],
    call,
  }) satisfies HubPlanView

describe('/dla-domu model', () => {
  const texts = hubForHome()

  it('situations: the call line, the steps as the start, only lines on the page', () => {
    const result = homeSituations(
      [
        situation('buduje-dom', 'instalacje', [{ line: 'instalacje', points: ['Plan'] }]),
        situation('gry', 'gaming', [{ line: 'gaming', points: ['PC'] }]),
      ],
      [line('instalacje'), line('tech')],
    )
    expect(result.map((entry) => entry.key)).toEqual(['buduje-dom'])
    expect(result[0]?.icon).toBe('building')
    expect(result[0]?.start).toEqual(['Krok 1', 'Krok 2'])
    expect(result[0]?.call?.key).toBe('instalacje')
  })

  it('scene: lines on the page, CTA to the line site, steps without text', () => {
    const areas = sceneAreas(texts.scene.items, [line('tech')])
    expect(areas.map((area) => area.line)).toEqual(['tech'])
    expect(areas[0]?.href).toBe('https://tech.test')
    expect(areas[0]?.steps.every((step) => step.text === '')).toBe(true)
  })

  it('examples keep only cards of lines on the page', () => {
    const examples = homeExamples(texts.together.examples, [line('instalacje')])
    expect(examples.length).toBeGreaterThan(0)
    expect(
      examples.every((example) => example.cards.every((card) => card.line === 'instalacje')),
    ).toBe(true)
  })
})
