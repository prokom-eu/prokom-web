import { describe, expect, it } from 'vitest'

import { isBlockAllowed } from '../../blocks/registry'

import { softwareAboutLayout, softwareOneCompanyLayout } from './about'

const about = softwareAboutLayout()
const oneCompany = softwareOneCompanyLayout()

describe('Software /o-firmie and /jedna-firma seed', () => {
  it('uses only blocks allowed on the Software line', () => {
    for (const block of [...about, ...oneCompany]) {
      expect(isBlockAllowed('software', block.blockType), block.blockType).toBe(true)
    }
  })

  it('opens both pages with the subpage hero and ends with the CTA', () => {
    for (const layout of [about, oneCompany]) {
      expect(layout[0]?.blockType).toBe('swPageHero')
      expect(layout.at(-1)?.blockType).toBe('callToAction')
    }
  })

  it('/o-firmie: comparison stays, no timeline and no second salon (v23)', () => {
    const sections = about.flatMap((block) =>
      block.blockType === 'swHomeSection' ? [block.section] : [],
    )
    expect(sections).toEqual(['compare'])
    const json = JSON.stringify(about)
    expect(json).not.toContain('Jak robimy')
    expect(json).not.toContain('Najpierw sprzęt i serwis')
    expect(json).not.toContain('Dwa salony')
    expect(
      about.some((block) => block.blockType === 'swSteps' && block.variant === 'timeline'),
    ).toBe(false)
  })

  it('/o-firmie: the team is Krystian Potaczek and Tadeusz Wójciak (board `ONas` v23)', () => {
    const people = about.flatMap((block) =>
      block.blockType === 'swTeam' && block.variant === 'people' ? (block.members ?? []) : [],
    )
    expect(people.map((person) => person.name)).toEqual(['Krystian Potaczek', 'Tadeusz Wójciak'])
  })

  it('names Software only in Rabka — no Zakopane on either page (v23)', () => {
    expect(JSON.stringify([...about, ...oneCompany])).not.toMatch(/Zakopan/i)
  })

  it('/jedna-firma: four lines with „Serwis” (not „Tech”), links only to sites that exist', () => {
    const items = oneCompany.flatMap((block) =>
      block.blockType === 'swLines' && block.variant === 'lines' ? (block.lines ?? []) : [],
    )
    expect(items.map((line) => line.name)).toEqual([
      'PRO-KOM Software',
      'PRO-KOM Biznes',
      'PRO-KOM Instalacje',
      'PRO-KOM Serwis',
    ])
    expect(items.flatMap((line) => (line.href ? [line.href] : []))).toEqual([
      'https://prokombiznes.pl',
      'https://prokominstalacje.pl',
      'https://prokomserwis.pl',
    ])
  })

  it('/o-firmie (SWV6): numbers right under the hero, four lines, no portraits', () => {
    expect(about.slice(0, 3).map((block) => block.blockType)).toEqual([
      'swPageHero',
      'swSteps',
      'swLines',
    ])
    const hero = about[0]
    expect(hero?.blockType === 'swPageHero' && hero.visual).toBe('none')
    const numbers = about[1]
    expect(
      numbers?.blockType === 'swSteps' && numbers.variant === 'stats' && !numbers.eyebrow,
    ).toBe(true)
    const lines = about.flatMap((block) =>
      block.blockType === 'swLines' && block.variant === 'lines' ? (block.lines ?? []) : [],
    )
    expect(lines.map((line) => line.name)).toEqual([
      'PRO-KOM Biznes',
      'PRO-KOM Instalacje',
      'PRO-KOM Serwis',
      'PRO-KOM Software',
    ])
    expect(lines.filter((line) => line.current).map((line) => line.name)).toEqual([
      'PRO-KOM Software',
    ])
    const json = JSON.stringify([...about, ...oneCompany])
    expect(json).not.toMatch(/Tech|Gaming|Portret/)
  })
})
