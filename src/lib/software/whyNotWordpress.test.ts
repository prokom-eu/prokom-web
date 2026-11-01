import { describe, expect, it } from 'vitest'

import { softwareSettingsData } from '../../seed/software/map'
import { homeSchema, type SoftwareHome } from './home'
import { whyNotWordpressView, withPublishedPostLink } from './whyNotWordpress'

const section = (): SoftwareHome['whyNotWordpress'] =>
  homeSchema.parse(softwareSettingsData().home).whyNotWordpress

/** Locally: the price of the rebuild filled in, everything else as it is. */
const filled = (text: string) => text.replace('{cena:przebudowa-starej-strony}', '1 499 zł')
/** Production without the price: a text with a token is not rendered. */
const strict = (text: string) => (/\{cena:[^}]+\}|\[[^\]]+\]/.test(text) ? null : text)

describe('whyNotWordpressView', () => {
  it('keeps the 3 facts with their sources, the 6 rows and the CTA of the package', () => {
    const view = whyNotWordpressView(section(), filled)
    expect(view?.title).toBe('Dlaczego nie robimy stron na WordPressie')
    expect(view?.facts.map((fact) => fact.value)).toEqual(['7 966', '72 h', '0'])
    expect(view?.facts[1]?.source).toBe('RODO, art. 33 i art. 83 ust. 4')
    expect(view?.columns).toEqual(['WordPress z wtyczkami', 'Strona od PRO-KOM'])
    expect(view?.rows.map((row) => row.name)).toEqual([
      'Szybkość',
      'Bezpieczeństwo',
      'Aktualizacje',
      'Wygląd',
      'Google i AI',
      'Zmiana treści',
    ])
    expect(view?.rows[0]).toMatchObject({
      theirs: 'motyw i kilkanaście wtyczek ładuje się przy każdym wejściu',
      ours: 'strona czeka gotowa, treść w mniej niż 2,5 s',
    })
    expect(view?.cta?.buttons).toEqual([
      { label: 'Sprawdź swoją stronę za darmo', href: '/audyt', primary: false },
      {
        label: 'Przebudowa od 1 499 zł →',
        href: '/rozwiazania/przebudowa-starej-strony',
        primary: true,
      },
    ])
    expect(view?.link?.href).toBe('/aktualnosci/wordpress-czy-strona-od-zera')
  })

  it('drops only the button whose price is missing on production', () => {
    const view = whyNotWordpressView(section(), strict)
    expect(view?.cta?.buttons.map((button) => button.label)).toEqual([
      'Sprawdź swoją stronę za darmo',
    ])
    // The one left becomes the main button.
    expect(view?.cta?.buttons[0]?.primary).toBe(true)
    expect(view?.facts).toHaveLength(3)
  })

  it('drops a fact without its source and a row with a missing cell', () => {
    const data = section()
    data.facts[0] = { ...data.facts[0]!, src: '[ŹRÓDŁO]' }
    data.compare.rows[2] = ['Aktualizacje', '[CO TYDZIEŃ]', 'robimy je my, w opiece']
    const view = whyNotWordpressView(data, strict)
    expect(view?.facts.map((fact) => fact.value)).toEqual(['72 h', '0'])
    expect(view?.rows.map((row) => row.name)).not.toContain('Aktualizacje')
    expect(view?.rows).toHaveLength(5)
  })

  it('renders no table unless it has the row names and two columns to compare', () => {
    const data = section()
    data.compare = { columns: ['WordPress', 'PRO-KOM'], rows: [['wolno', 'szybko']] }
    expect(whyNotWordpressView(data, filled)?.rows).toEqual([])
  })

  it('renders nothing without its heading, and no CTA without its title', () => {
    expect(whyNotWordpressView({ ...section(), title: '[TYTUŁ]' }, strict)).toBeNull()
    const data = section()
    data.cta = { ...data.cta, title: '[TYTUŁ]' }
    expect(whyNotWordpressView(data, strict)?.cta).toBeNull()
  })
})

describe('withPublishedPostLink', () => {
  const link = { label: 'Uczciwe porównanie →', href: '/aktualnosci/wordpress-czy-strona-od-zera' }

  it('drops the link to a post that is not public (a draft awaiting approval, SWV6)', () => {
    expect(withPublishedPostLink(link, new Set())).toBeNull()
    expect(withPublishedPostLink(link, new Set(['wordpress-czy-strona-od-zera']))).toEqual(link)
  })

  it('keeps a link that does not lead to a post', () => {
    const other = { label: 'Cennik', href: '/cennik' }
    expect(withPublishedPostLink(other, new Set())).toEqual(other)
    expect(withPublishedPostLink(null, new Set())).toBeNull()
  })
})
