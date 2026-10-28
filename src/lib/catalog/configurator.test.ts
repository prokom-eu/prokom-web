import { describe, expect, it } from 'vitest'

import { optionHelp } from './configHelp'
import {
  ADVISE,
  EMPTY_STATE,
  addAction,
  buildConfigurator,
  chosenValues,
  configNote,
  presetSelection,
  togglePreset,
  toggleValue,
  versionSelection,
} from './configurator'
import { variantSlug } from './productName'

// The ThinkBook 14 G8 / G9 card, shortened (`k31/screens/Web-Produkt-1440`).
const RAW = {
  description: 'Wybierasz generację, procesor, pamięć i dysk.',
  options: [
    {
      name: 'Generacja i platforma',
      values: [
        'G8 IRL — Intel Core 3 100U / Core 5 210H / Core 7 240H / Core i5-13420H',
        'G9 IRL — Intel Core 3 100U / Core 5 210H / Core 7 240H / Core i5-13420H',
        'G9 AHP — AMD Ryzen 3 205 / 210, Ryzen 5 216 / 220, Ryzen 7 249 / 250',
      ],
    },
    { name: 'Procesor', values: ['Intel Core 5 210H', 'Intel Core 7 240H', 'AMD Ryzen 7 250'] },
    { name: 'Pamięć RAM', values: ['16 GB', '32 GB'], note: 'DDR5, 2 gniazda SODIMM.' },
    { name: 'Dysk SSD', values: ['256 GB', '512 GB', '1 TB', '512 GB '] },
    { name: 'System', values: ['Windows 11 Pro', 'Windows 11 Home', 'bez systemu'] },
    { name: 'Kolor', values: ['Arctic Grey'] },
    { name: 'Pusta', values: [] },
  ],
  popular: [
    { name: 'Biuro', configuration: 'G9 IRL, Intel Core 5 210H / 16 GB / 512 GB / Windows 11 Pro' },
    { name: 'Wydajny — AMD', configuration: 'G9 AHP, AMD Ryzen 7 250 / 16 GB / 512 GB' },
  ],
}

const VARIANTS = ['G8 IRL (Intel)', 'G9 IRL (Intel)', 'G9 AHP (AMD)']

const config = buildConfigurator(RAW)!

describe('buildConfigurator', () => {
  it('shows every option with ≥ 2 values and moves single ones to „W każdej wersji”', () => {
    expect(config.options.map((option) => option.name)).toEqual([
      'Generacja i platforma',
      'Procesor',
      'Pamięć RAM',
      'Dysk SSD',
      'System',
    ])
    expect(config.standard).toEqual([{ name: 'Kolor', value: 'Arctic Grey' }])
    expect(config.options[3]!.values).toEqual(['256 GB', '512 GB', '1 TB'])
  })

  it('lays long values out as rows, short ones as chips, with help and the producer note', () => {
    expect(config.options[0]!.rows).toBe(true)
    expect(config.options[2]!.rows).toBe(false)
    expect(config.options[2]!.help).toContain('pamięci RAM')
    expect(config.options[2]!.note).toBe('DDR5, 2 gniazda SODIMM.')
  })

  it('is null when nothing can be chosen', () => {
    expect(buildConfigurator({ options: [{ name: 'Kolor', values: ['Czarny'] }] })).toBeNull()
    expect(buildConfigurator(null)).toBeNull()
  })
})

describe('ready configurations', () => {
  it('fill the matching options', () => {
    expect(presetSelection(config.options, RAW.popular[0]!.configuration)).toEqual({
      0: RAW.options[0]!.values![1],
      1: 'Intel Core 5 210H',
      2: '16 GB',
      3: '512 GB',
      4: 'Windows 11 Pro',
    })
  })

  it('never match inside a longer number', () => {
    expect(presetSelection(config.options, 'dysk 1512 GB, 116 GB RAM')).toEqual({})
  })

  it('a second click clears the choice', () => {
    const once = togglePreset(config, EMPTY_STATE, 1)
    expect(once.preset).toBe(1)
    expect(once.selection[1]).toBe('AMD Ryzen 7 250')
    expect(togglePreset(config, once, 1)).toEqual(EMPTY_STATE)
  })
})

describe('values and the note', () => {
  it('picks and clears a value or „Doradźcie”', () => {
    const picked = toggleValue(EMPTY_STATE, 2, '32 GB')
    expect(picked.selection).toEqual({ 2: '32 GB' })
    expect(toggleValue(picked, 2, '32 GB').selection).toEqual({})
    expect(toggleValue(picked, 2, ADVISE).selection).toEqual({ 2: ADVISE })
  })

  it('writes the note with the ready configuration, values and „doradźcie”', () => {
    let state = togglePreset(config, EMPTY_STATE, 0)
    state = toggleValue(state, 1, ADVISE)
    expect(configNote(config, state)).toBe(
      `Wersja: Biuro · Generacja i platforma: ${RAW.options[0]!.values![1]} · Procesor: doradźcie · Pamięć RAM: 16 GB · Dysk SSD: 512 GB · System: Windows 11 Pro`,
    )
    expect(configNote(config, EMPTY_STATE)).toBe('')
    expect(chosenValues(config, state).map((row) => row.name)).not.toContain('Procesor')
  })
})

describe('?wersja=', () => {
  it('picks the model value of the option that names the versions', () => {
    expect(versionSelection(config, VARIANTS, 'g9-ahp')).toEqual({
      preset: null,
      selection: { 0: RAW.options[0]!.values![2] },
    })
  })

  it('matches a model named a bit differently, never the next size up', () => {
    const x9 = buildConfigurator({
      options: [
        {
          name: 'Model',
          values: ['X9 14 Gen 1 (14")', 'X9 15 Gen 1 (15,3")', 'X9 15p Gen 1 (15,3", mocniejszy)'],
        },
      ],
    })!
    const names = [
      'X9 14 Gen 1 Aura Edition',
      'X9 15 Gen 1 Aura Edition',
      'X9 15p Gen 1 Aura Edition',
    ]
    expect(versionSelection(x9, names, variantSlug(names[1]!)).selection).toEqual({
      0: 'X9 15 Gen 1 (15,3")',
    })
    expect(versionSelection(x9, names, variantSlug(names[2]!)).selection).toEqual({
      0: 'X9 15p Gen 1 (15,3", mocniejszy)',
    })
  })

  it('ignores an unknown or missing version', () => {
    expect(versionSelection(config, VARIANTS, 'g7-xyz')).toEqual(EMPTY_STATE)
    expect(versionSelection(config, VARIANTS, null)).toEqual(EMPTY_STATE)
  })
})

describe('addAction', () => {
  it('adds, saves a changed version or takes the product off the list', () => {
    expect(addAction(false, '', 'Wersja: Biuro')).toBe('add')
    expect(addAction(true, 'Wersja: Biuro', 'Wersja: Biuro')).toBe('remove')
    expect(addAction(true, '', 'Wersja: Biuro')).toBe('update')
  })

  it('never wipes a saved version with an empty choice (a reload empties the configurator)', () => {
    expect(addAction(true, 'Wersja: Biuro · Pamięć RAM: 16 GB', '')).toBe('remove')
  })

  it('compares the note as the list keeps it — trimmed to 500 characters', () => {
    const long = `Wersja: ${'x'.repeat(600)}`
    expect(addAction(true, long.slice(0, 500), long)).toBe('remove')
  })
})

describe('optionHelp', () => {
  it('matches options by name', () => {
    expect(optionHelp('Procesor')).toContain('Od procesora')
    expect(optionHelp('Łączność z CRK')).toContain('Centralnego Repozytorium Kas')
    expect(optionHelp('Model / szerokość druku')).toContain('Czym różnią się wersje')
    expect(optionHelp('Rozdzielczość')).toBeNull()
  })
})
