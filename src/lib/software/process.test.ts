import { describe, expect, it } from 'vitest'

import stronaGlowna from '../../../seed/prokomsoftware/strona-glowna.json'
import { homeSchema } from './home'
import { processQuote, processStages, stageEyebrow } from './process'
import { softwareSettingsData } from '../../seed/software/map'

const stages = () => homeSchema.parse(softwareSettingsData().home).process

/** Production: a text with a placeholder is not rendered. */
const strict = (text: string) => (/\[[A-ZĄĆĘŁŃÓŚŹŻ ]+\]/.test(text) ? null : text)
/** Facts filled in. */
const filled = (text: string) =>
  text
    .replace('[DNI]', '5–7')
    .replace('[ZALICZKA]', '30%')
    .replace(/\[[^\]]+\]/g, 'X')

describe('processStages', () => {
  it('keeps the 5 stages of the package in order', () => {
    const result = processStages(stages(), filled)
    expect(result.map((stage) => stage.name)).toEqual([
      'Rozmowa',
      'Podgląd i wycena',
      'Budowa',
      'Wdrożenie',
      'Opieka',
    ])
    expect(result).toHaveLength(stronaGlowna.process.length)
    expect(result[1]).toMatchObject({ duration: '5–7 dni', pay: 'Płacisz: 30% po podpisaniu' })
  })

  it('drops only what has a missing fact on production', () => {
    const result = processStages(stages(), strict)
    const [, review, build, , care] = result
    // „[DNI] dni” — no duration, the stage stays; the payment note has no fact (board, SWR5).
    expect(review).toMatchObject({ num: '02', duration: null, pay: null })
    expect(review?.payNote).toMatch(/^Reszta: przy stronach \(70%\) po odbiorze/)
    // „Pierwszy etap działający po [CZAS PIERWSZEGO ETAPU]” — that one point goes.
    expect(build?.get).toEqual(['Wersję testową co tydzień', 'Listę zmian po każdym tygodniu'])
    expect(care?.pay).toBeNull()
    // Texts without facts are untouched.
    expect(result[0]).toMatchObject({ duration: '30 min', pay: 'Płacisz: 0 zł' })
  })

  it('skips a stage whose name or heading cannot be shown', () => {
    const [first, ...rest] = stages()
    const broken = { ...first!, h: 'Rozmowa [BRAK]' }
    expect(processStages([broken, ...rest], strict).map((stage) => stage.num)).toEqual([
      '02',
      '03',
      '04',
      '05',
    ])
  })
})

describe('stageEyebrow', () => {
  it('puts the number and the duration in the template', () => {
    expect(stageEyebrow('Etap {num} · {t}', { num: '01', duration: '30 min' })).toBe(
      'Etap 01 · 30 min',
    )
  })

  it('leaves out the duration part when there is none', () => {
    expect(stageEyebrow('Etap {num} · {t}', { num: '02', duration: null })).toBe('Etap 02')
  })
})

describe('processQuote', () => {
  const quote = () => homeSchema.parse(softwareSettingsData().home).proceduralMock

  it('keeps the sample quote of the package as it is', () => {
    expect(processQuote(quote(), strict)).toEqual({
      number: 'PKS-2026-0142',
      title: 'System zleceń + czas pracy',
      rows: [
        ['Etap 1 · zlecenia i grafik', '5 990 zł'],
        ['Etap 2 · czas pracy ekip', '2 990 zł'],
        ['Połączenie z Subiektem', 'po sprawdzeniu programu'],
      ],
      total: '8 980 zł netto (etapy 1–2)',
      totalLabel: 'Razem etapy 1–2, stała cena',
      term: '10 tygodni',
    })
  })

  it('drops a row with a missing fact on production', () => {
    const value = {
      ...quote(),
      rows: [...quote().rows, ['Opieka', 'od [OPIEKA OD] zł'] as [string, string]],
    }
    expect(processQuote(value, strict)?.rows).toHaveLength(3)
  })

  it('hides the whole quote when its title, total or term cannot be shown', () => {
    expect(processQuote({ ...quote(), term: '[TYGODNIE] tygodni' }, strict)).toBeNull()
    expect(processQuote({ ...quote(), total: '[KWOTA] zł' }, strict)).toBeNull()
    expect(processQuote({ ...quote(), term: '[TYGODNIE] tygodni' }, filled)?.term).toBe('X tygodni')
  })
})
