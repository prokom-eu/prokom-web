import { describe, expect, it } from 'vitest'

import { softwareSettingsData } from '../../seed/software/map'
import { homeSchema } from './home'
import { howWeBuildView, technologiesView } from './howWeBuild'

const home = homeSchema.parse(softwareSettingsData().home)
const howWeBuild = home.sections!.howWeBuild!
const technologies = home.sections!.technologies!

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

  it('keeps the threshold source and the result line, with no empty promise (v23)', () => {
    const view = howWeBuildView(howWeBuild, loose)
    expect(view?.source).toMatch(/Google Search Central/)
    expect(view?.result).toBe(
      'Wynik szybkości każdej oddanej strony zapisujemy w protokole odbioru.',
    )
    expect(JSON.stringify(howWeBuild)).not.toContain('[WYNIK]')
  })

  it('drops only the result line when it loses a fact on production', () => {
    const view = howWeBuildView(howWeBuild, (text) => (text === howWeBuild.result ? null : text))
    expect(view?.source).toMatch(/Google Search Central/)
    expect(view?.result).toBeNull()
  })

  it('is not rendered without a card (every card lost a fact on production)', () => {
    const gains = new Set(howWeBuild.cards.map((card) => card.gain))
    expect(howWeBuildView(howWeBuild, (text) => (gains.has(text) ? null : text))).toBe(null)
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

  it('shows only the Google thresholds — no unmeasured score of our own (v23)', () => {
    const view = technologiesView(technologies, home.technologies, loose)
    expect(view?.layers[0]?.figures.map((figure) => figure.value)).toEqual(['< 2,5 s', '< 200 ms'])
  })

  it('drops a figure without its value on production, never the layer', () => {
    const view = technologiesView(technologies, home.technologies, (text) =>
      text === '< 200 ms' ? null : text,
    )
    const site = view?.layers[0]
    expect(site?.figures.map((figure) => figure.value)).toEqual(['< 2,5 s'])
    expect(site?.gain).toBeTruthy()
  })
})
