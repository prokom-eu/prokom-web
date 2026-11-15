import { describe, expect, it } from 'vitest'

import stronaGlowna from '../../../seed/prokomsoftware/strona-glowna.json'
import { homeSchema } from './home'
import { processStages, stageEyebrow } from './process'
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
