import { describe, expect, it } from 'vitest'

import { softwareSettingsData } from '../../seed/software/map'
import { homeSchema } from './home'
import { livePreviews } from './previews'

const previews = () => homeSchema.parse(softwareSettingsData().home).livePreviews
const same = (text: string) => text
/** Production with a missing fact in every text that has one. */
const strict = (text: string) => (text.includes('[') ? null : text)

describe('livePreviews', () => {
  it('keeps the board order whatever the order of the stored keys (jsonb)', () => {
    const { www, rez, sys, app, auto } = previews()
    const result = livePreviews({ app: app!, auto: auto!, rez: rez!, sys: sys!, www: www! }, same)
    expect(result.map((preview) => [preview.kind, preview.label])).toEqual([
      ['www', 'Strona'],
      ['rez', 'Rezerwacje'],
      ['sys', 'System firmowy'],
      ['app', 'Aplikacja mobilna'],
      ['auto', 'Automatyzacje i AI'],
    ])
  })

  it('maps the notes, the steps and the project entry of the board', () => {
    const [www] = livePreviews(previews(), same)
    expect(www?.notes).toEqual([
      { title: 'Nowe zapytanie z formularza', text: 'remont łazienki · przed chwilą' },
      { title: 'Wersja na telefon', text: 'gotowa od pierwszego dnia' },
    ])
    expect(www?.steps[0]).toEqual({
      title: 'Klient wchodzi z Google',
      text: 'na telefonie, strona gotowa w mniej niż 2,5 sekundy',
    })
    expect(www?.project).toEqual({ id: 'hero-www', name: 'strona' })
    const auto = livePreviews(previews(), same).find((preview) => preview.kind === 'auto')
    expect(auto?.project.name).toBe('automatyzacje i AI')
  })

  it('skips a preview without a mock-up in code', () => {
    const { www, ...rest } = previews()
    const result = livePreviews({ inne: www!, ...rest }, same)
    expect(result.map((preview) => preview.kind)).toEqual(['rez', 'sys', 'app', 'auto'])
  })

  it('drops what cannot be shown on production', () => {
    const value = previews()
    value.www = { ...value.www!, title: 'Strona [BRAK]' }
    value.rez = {
      ...value.rez!,
      a: 'Rezerwacja [BRAK]',
      steps: [['Krok [BRAK]', 'opis'], ...value.rez!.steps.slice(1)],
    }
    const result = livePreviews(value, strict)
    expect(result.map((preview) => preview.kind)).not.toContain('www')
    const rez = result.find((preview) => preview.kind === 'rez')
    expect(rez?.notes.map((note) => note.title)).toEqual(['PL · EN · DE'])
    expect(rez?.steps).toHaveLength(2)
  })
})
