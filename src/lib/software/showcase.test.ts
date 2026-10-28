import { describe, expect, it } from 'vitest'

import { softwareSettingsData } from '../../seed/software/map'
import { homeSchema, type SoftwareHome } from './home'
import { showcaseView } from './showcase'

const section = (): SoftwareHome['showcase'] =>
  homeSchema.parse(softwareSettingsData().home).showcase

/** Locally / staging: tokens stay visible. */
const loose = (text: string) => text
/** Production: a text with a missing fact is not rendered. */
const strict = (text: string) => (/\[[^\]]+\]/.test(text) ? null : text)

describe('showcaseView', () => {
  it('keeps the 3 own systems and the 4 figures of the package', () => {
    const view = showcaseView(section(), 'Realizacje', loose)
    expect(view?.eyebrow).toBe('Realizacje')
    expect(view?.title).toBe('Najpierw zbudowaliśmy to dla siebie.')
    expect(view?.items.map((item) => [item.name, item.live])).toEqual([
      ['prokomserwis.pl', true],
      ['pro-kom.eu', true],
      ['prokombiznes.pl', false],
    ])
    expect(view?.items[0]?.url).toBe('https://prokomserwis.pl')
    expect(view?.stats.map((stat) => stat.value)).toEqual(['2004', '100+', '[WYNIK]', '0'])
  })

  it('drops the figure without its measured value on production', () => {
    const view = showcaseView(section(), 'Realizacje', strict)
    expect(view?.stats.map((stat) => stat.value)).toEqual(['2004', '100+', '0'])
  })

  it('is not rendered without its heading', () => {
    expect(showcaseView({ ...section(), title: '[BRAK]' }, 'Realizacje', strict)).toBeNull()
  })

  it('treats any status other than „działa” as work in progress', () => {
    const data = section()
    const items = data.items.map((item) => ({ ...item, status: 'Działa ' }))
    items.push({ ...data.items[0]!, name: 'nowy.pl', status: 'wkrótce' })
    const view = showcaseView({ ...data, items }, 'Realizacje', loose)
    expect(view?.items.map((item) => item.live)).toEqual([true, true, true, false])
  })
})
