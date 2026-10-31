import { describe, expect, it } from 'vitest'

import { softwareSettingsData } from '../../seed/software/map'
import { homeSchema } from './home'
import { howWeBuildView, technologiesView } from './howWeBuild'

const home = homeSchema.parse(softwareSettingsData().home)
const howWeBuild = home.sections!.howWeBuild!
const technologies = home.sections!.technologies!

/** Production fill: `[WYNIK]` has no value, so a text with it is not shown. */
const strict = (text: string) => (text.includes('[WYNIK]') ? null : text)
const loose = (text: string) => text

describe('„Jak robimy”', () => {
  it('has the three cards of the board: speed, safety, Google and AI', () => {
    const view = howWeBuildView(howWeBuild, loose)
    expect(view?.cards.map((card) => card.name)).toEqual([
      'Szybka',
      'Bezpieczna',
      'Widoczna w Google i AI',
    ])
    expect(view?.cards[0]).toMatchObject({ badge: '< 2,5 s', kind: 'speed' })
    expect(view?.cards[2]?.badge).toBeUndefined()
  })

  it('keeps the threshold source when the measured result is empty (production)', () => {
    const view = howWeBuildView(howWeBuild, strict)
    expect(view?.source).toMatch(/Google Search Central/)
    expect(view?.result).toBeNull()
  })

  it('is not rendered without its heading', () => {
    expect(howWeBuildView(howWeBuild, (text) => (text === howWeBuild.title ? null : text))).toBe(
      null,
    )
  })
})

describe('„Z czego budujemy”', () => {
  it('lists the 6 layers of technologie.json with their tools', () => {
    const view = technologiesView(technologies, home.technologies, loose)
    expect(view?.layers.map((layer) => layer.name)).toEqual([
      'Strona',
      'Panel',
      'System',
      'Aplikacja',
      'Dane',
      'Serwer',
    ])
    expect(view?.layers[0]).toMatchObject({ tools: ['Next.js', 'TypeScript'] })
  })

  it('drops a figure without its value on production, never the layer', () => {
    const view = technologiesView(technologies, home.technologies, strict)
    const site = view?.layers[0]
    expect(site?.figures.map((figure) => figure.value)).toEqual(['< 2,5 s', '< 200 ms'])
    expect(site?.gain).toBeTruthy()
  })
})
