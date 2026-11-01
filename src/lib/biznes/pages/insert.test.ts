import { describe, expect, it } from 'vitest'

import {
  formatPoints,
  INSPOINTS_STEP,
  insPointsLabel,
  insPointsNote,
  insPointsUsage,
  pickProgram,
  poolCoverage,
  type ProgramQuestion,
  type ProgramRule,
} from './insert'

const QUESTIONS: ProgramQuestion[] = [
  {
    q: 'Gdzie chcesz pracować?',
    options: [
      { t: 'Na komputerach', k: 'desk' },
      { t: 'W przeglądarce', k: 'web' },
    ],
  },
  {
    q: 'Ile magazynów?',
    options: [
      { t: 'Jeden', k: 'one' },
      { t: 'Kilka', k: 'multi' },
    ],
  },
  {
    q: 'Pracujesz na GT?',
    options: [
      { t: 'Nie', k: 'new' },
      { t: 'Tak', k: 'gt' },
    ],
  },
]

const RULES: ProgramRule[] = [
  { when: ['web'], slug: 'subiekt-123', why: 'Przeglądarka' },
  { when: ['multi'], slug: 'subiekt-nexo', why: 'Magazyny' },
  { when: ['gt'], slug: 'subiekt-gt', why: 'GT' },
  { when: [], slug: 'subiekt-nexo', why: 'Nowa firma' },
]

describe('„Który Subiekt” (K4h, K33 §7)', () => {
  it('the first option of each question is picked by default and gives nexo', () => {
    expect(pickProgram(QUESTIONS, RULES, []).slug).toBe('subiekt-nexo')
  })

  it('3 combinations give 123 / GT / nexo', () => {
    expect(pickProgram(QUESTIONS, RULES, [1, 0, 0]).slug).toBe('subiekt-123')
    expect(pickProgram(QUESTIONS, RULES, [0, 0, 1]).slug).toBe('subiekt-gt')
    expect(pickProgram(QUESTIONS, RULES, [0, 1, 1]).slug).toBe('subiekt-nexo')
  })

  it('the first matching rule wins (browser beats GT)', () => {
    expect(pickProgram(QUESTIONS, RULES, [1, 1, 1]).slug).toBe('subiekt-123')
  })

  it('the fallback is the rule without conditions, wherever it stands', () => {
    const shuffled = [RULES[3]!, RULES[0]!, RULES[1]!, RULES[2]!]
    expect(pickProgram(QUESTIONS, shuffled, [0, 0, 0]).slug).toBe('subiekt-nexo')
    expect(pickProgram(QUESTIONS, shuffled, [1, 0, 0]).slug).toBe('subiekt-123')
  })

  it('an answer out of range falls back to the first option', () => {
    expect(pickProgram(QUESTIONS, RULES, [9, -1, 0]).slug).toBe('subiekt-nexo')
  })
})

describe('InsPunkty (K4h, K34 §5)', () => {
  it('40 + 30 → 70 a month and 840 a year', () => {
    expect(insPointsUsage(40, 30)).toEqual({ month: 70, year: 840 })
    expect(insPointsLabel(70)).toBe('70 InsPunktów')
    expect(insPointsLabel(840)).toBe('840 InsPunktów')
  })

  it('declines the word', () => {
    expect(insPointsLabel(1)).toBe('1 InsPunkt')
    expect(insPointsLabel(22)).toBe('22 InsPunkty')
    expect(insPointsLabel(12)).toBe('12 InsPunktów')
    expect(insPointsLabel(0)).toBe('0 InsPunktów')
  })

  it('separates thousands with a non-breaking space', () => {
    expect(formatPoints(4440)).toBe('4 440')
    expect(insPointsLabel(4440)).toBe('4 440 InsPunktów')
  })

  it('never goes below zero and steps by 5', () => {
    expect(INSPOINTS_STEP).toBe(5)
    expect(insPointsUsage(-5, 10)).toEqual({ month: 10, year: 120 })
  })

  it('says how long the pool of 100 lasts', () => {
    expect(poolCoverage(100, 0)).toBeNull()
    expect(poolCoverage(100, 5)).toBe('cały rok')
    expect(poolCoverage(100, 70)).toBe('ok. 1,4 miesiąca')
    expect(poolCoverage(100, 370)).toBe('mniej niż miesiąc')
  })

  it('note of the inquiry position', () => {
    expect(insPointsNote(70)).toBe('InsPunkty: 70 / mies.')
  })
})
