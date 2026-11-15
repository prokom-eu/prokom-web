import { describe, expect, it } from 'vitest'

import type { HubToolView } from '@/lib/prokom/data'

import type { HomeLine } from './model'
import { toolGroups, toolPreview } from './toolGroups'

const tool = (key: string, line: HubToolView['line'], featuredOnHome: boolean): HubToolView => ({
  key,
  line,
  action: 'zglos',
  title: key,
  desc: 'opis',
  inputs: ['Model', 'Opis'],
  result: null,
  ctaLabel: 'Otwórz',
  url: null,
  badge: null,
  preview: { kind: 'steps', steps: ['A', 'B', 'C'], done: 9 },
  featuredOnHome,
})

const line = (key: HomeLine['key']) =>
  ({
    key,
    name: key,
    label: key,
    domain: `${key}.test`,
    url: `https://${key}.test`,
    promise: null,
  }) as HomeLine

describe('toolPreview', () => {
  it('maps the stored kinds and keeps the step within the bar', () => {
    expect(toolPreview({ kind: 'form', fields: ['A', 'B', 'C', 'D'] }, [])).toEqual({
      kind: 'list',
      items: ['A', 'B', 'C'],
    })
    expect(toolPreview({ kind: 'steps', steps: ['A', 'B'], done: 5 }, [])).toMatchObject({
      done: 1,
    })
    expect(toolPreview({ kind: 'win', winText: 'x.pl' }, [])).toEqual({ kind: 'win', text: 'x.pl' })
  })

  it('falls back to the inputs, or nothing, for an unknown preview', () => {
    expect(toolPreview({ kind: 'video' }, ['Model'])).toEqual({ kind: 'list', items: ['Model'] })
    expect(toolPreview(null, [])).toBeNull()
  })
})

describe('toolGroups', () => {
  it('takes two home tools of each line on the page and counts all of them', () => {
    const tools = [
      tool('a', 'tech', true),
      tool('b', 'tech', true),
      tool('c', 'tech', true),
      tool('d', 'tech', false),
      tool('e', 'gaming', true),
    ]
    const { groups, counts, total } = toolGroups([line('tech')], tools)
    expect(groups).toHaveLength(1)
    expect(groups[0]?.tools.map((t) => t.key)).toEqual(['a', 'b'])
    expect(groups[0]?.tools[0]?.url).toBe('https://tech.test')
    expect(counts).toEqual([{ line: 'tech', name: 'tech', count: 4 }])
    expect(total).toBe(4)
  })

  it('orders the groups Biznes, Software, Instalacje, Tech, Gaming (Krystian 15.11)', () => {
    const keys = ['biznes', 'instalacje', 'software', 'tech', 'gaming'] as const
    const all = keys.map((key) => line(key))
    const tools = keys.map((key) => tool(key, key, true))
    expect(toolGroups(all, tools).groups.map((group) => group.line.key)).toEqual([
      'biznes',
      'software',
      'instalacje',
      'tech',
      'gaming',
    ])
  })
})
