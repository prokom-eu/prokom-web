import { describe, expect, it } from 'vitest'

import type { HubPlanView } from '@/lib/prokom/data'
import { stepsWithPromise } from '@/lib/prokom/forBusiness'

import { hubForBusiness } from '../../../seed/prokom/map'
import { areas, type BusinessLineInfo, industries, situations } from './model'

const line = (
  key: BusinessLineInfo['key'],
  promise: string | null = 'Szybko',
): BusinessLineInfo => ({
  key,
  name: key,
  label: key.toUpperCase(),
  domain: `${key}.test`,
  url: `https://${key}.test`,
  phone: '111 222 333',
  tel: 'tel:+48111222333',
  promise,
})

const plan = (key: string, groups: HubPlanView['groups']): HubPlanView => ({
  key,
  type: 'branza',
  name: key,
  title: null,
  lead: null,
  groups,
  start: ['a'],
  questions: ['b'],
  steps: [],
  call: null,
})

describe('/dla-firm model', () => {
  const texts = hubForBusiness()

  it('the package texts pass the schema and never promise training as standard', () => {
    const json = JSON.stringify(texts)
    expect(json).not.toMatch(
      /programujemy i szkolimy|i szkolenie robimy|konfiguracja, przeniesienie/,
    )
    expect(json).not.toContain('opiekun')
  })

  it('fills the promise into a step and drops the step without one', () => {
    const steps = [
      { title: 'A', text: 'a' },
      { title: '{obietnica}', text: 'b' },
    ]
    expect(stepsWithPromise(steps, 'Oddzwaniamy')).toEqual([
      { title: 'A', text: 'a' },
      { title: 'Oddzwaniamy', text: 'b' },
    ])
    expect(stepsWithPromise(steps, null)).toHaveLength(1)
  })

  it('keeps industries and areas of lines on the page, with their own hub page', () => {
    const lines = [line('biznes'), line('instalacje')]
    const result = industries(
      [
        plan('gastro', [
          { line: 'tech', points: ['x'] },
          { line: 'biznes', points: ['Kasa'] },
        ]),
        plan('x', []),
      ],
      texts.industries.subs,
      lines,
    )
    expect(result.map((entry) => entry.key)).toEqual(['gastro'])
    expect(result[0]?.icon).toBe('food')
    expect(result[0]?.groups.map((group) => group.key)).toEqual(['biznes'])

    const shown = areas(texts.areas.items, lines)
    expect(shown.every((area) => area.line === 'biznes' || area.line === 'instalacje')).toBe(true)
    expect(shown.find((area) => area.title === 'Dostawy i instytucje')?.href).toBe(
      '/inwestycje-i-dostawy',
    )
    expect(JSON.stringify(shown)).not.toContain('{obietnica}')
  })

  it('leaves out a situation with a step of a line that is not on the page', () => {
    const all = situations(texts.situations.items, [
      line('biznes'),
      line('instalacje'),
      line('software'),
    ])
    const noSoftware = situations(texts.situations.items, [line('biznes'), line('instalacje')])
    expect(all.length).toBe(texts.situations.items.length)
    expect(noSoftware.length).toBeLessThan(all.length)
  })
})
