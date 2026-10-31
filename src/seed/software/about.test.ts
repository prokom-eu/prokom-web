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

  it('/o-firmie: comparison stays, „Jak robimy” and technologies are on the start page (v21)', () => {
    const sections = about.flatMap((block) =>
      block.blockType === 'swHomeSection' ? [block.section] : [],
    )
    expect(sections).toEqual(['compare'])
    const json = JSON.stringify(about)
    expect(json).not.toContain('Jak robimy')
    expect(json).toContain('[ROK ZAKOPANE]')
    expect(json).toContain('[ROK SERWIS KAS]')
  })

  it('/jedna-firma: five lines with „Tech”, links only to sites that exist', () => {
    const items = oneCompany.flatMap((block) =>
      block.blockType === 'swLines' && block.variant === 'lines' ? (block.lines ?? []) : [],
    )
    expect(items.map((line) => line.name)).toEqual([
      'PRO-KOM Software',
      'PRO-KOM Biznes',
      'PRO-KOM Instalacje',
      'PRO-KOM Tech',
      'PRO-KOM Zakopane',
    ])
    expect(items.flatMap((line) => (line.href ? [line.href] : []))).toEqual([
      'https://prokombiznes.pl',
      'https://prokominstalacje.pl',
      'https://prokomserwis.pl',
    ])
  })
})
