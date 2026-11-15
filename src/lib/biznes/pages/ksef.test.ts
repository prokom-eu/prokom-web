import { describe, expect, it } from 'vitest'

import {
  isAfterSwitch,
  ksefQuizResult,
  timelineStatus,
  visibleQuestions,
  type KsefQuiz,
} from './ksef'

const SWITCH = '2027-01-01'

const QUIZ: KsefQuiz = {
  questions: [
    {
      key: 'b2b',
      t: 'Wystawiasz faktury dla firm?',
      options: [
        { k: 'tak', n: 'Tak' },
        { k: 'nie', n: 'Nie' },
      ],
    },
    {
      key: 'lim',
      t: 'Ile sprzedajesz poza KSeF?',
      beforeOnly: true,
      options: [
        { k: 'pod', n: 'do 10 000 zł brutto' },
        { k: 'nad', n: 'więcej' },
      ],
    },
    {
      key: 'kasa',
      t: 'Faktury do paragonów?',
      options: [
        { k: 'tak', n: 'Tak' },
        { k: 'nie', n: 'Nie' },
      ],
    },
  ],
  results: {
    consumer: { t: 'Konsumenci', l: ['dobrowolnie'] },
    now: { t: 'Już teraz', l: ['od 1 kwietnia'] },
    soon: { t: 'Do 31 grudnia', l: ['po staremu'] },
    after: { t: 'W KSeF', l: ['od 2027'] },
    registerNote: 'Faktury z kasy do końca 2026 poza KSeF.',
  },
}

describe('isAfterSwitch (D-K4-7: texts switch on 1.01.2027 in Europe/Warsaw)', () => {
  it('switches at midnight in Poland, not in UTC', () => {
    // 23:30 UTC on 31.12 is already 1.01 in Warsaw.
    expect(isAfterSwitch(SWITCH, new Date('2026-12-31T22:59:00Z'))).toBe(false)
    expect(isAfterSwitch(SWITCH, new Date('2026-12-31T23:30:00Z'))).toBe(true)
    expect(isAfterSwitch(SWITCH, new Date('2027-03-01T10:00:00Z'))).toBe(true)
  })

  it('`?ksefpo=1` shows the version after the date earlier', () => {
    expect(isAfterSwitch(SWITCH, new Date('2026-11-02T10:00:00Z'), '?ksefpo=1')).toBe(true)
    expect(isAfterSwitch(SWITCH, new Date('2026-11-02T10:00:00Z'), '?x=1&ksefpo=1')).toBe(true)
    expect(isAfterSwitch(SWITCH, new Date('2026-11-02T10:00:00Z'), '?ksefpo=0')).toBe(false)
  })

  it('an invalid date never switches', () => {
    expect(isAfterSwitch('nope', new Date('2030-01-01T00:00:00Z'))).toBe(false)
  })
})

describe('timelineStatus', () => {
  const now = new Date('2026-11-02T10:00:00Z')
  it('past dates are „obowiązuje”, the next one „następne”, the rest „wkrótce”', () => {
    const dates = ['2026-02-01', '2026-04-01', '2026-12-31', '2027-01-01']
    expect(dates.map((d, i) => timelineStatus(dates, i, now))).toEqual([
      'obowiązuje',
      'obowiązuje',
      'następne',
      'wkrótce',
    ])
  })

  it('after the switch every point is „obowiązuje”', () => {
    const dates = ['2026-02-01', '2027-01-01']
    const later = new Date('2027-01-05T10:00:00Z')
    expect(dates.map((d, i) => timelineStatus(dates, i, later))).toEqual([
      'obowiązuje',
      'obowiązuje',
    ])
  })
})

describe('KSeF quiz (K35 §2, K36 §3)', () => {
  it('drops the limit question after the switch', () => {
    expect(visibleQuestions(QUIZ, false).map((q) => q.key)).toEqual(['b2b', 'lim', 'kasa'])
    expect(visibleQuestions(QUIZ, true).map((q) => q.key)).toEqual(['b2b', 'kasa'])
  })

  it('consumers only → no obligation', () => {
    expect(ksefQuizResult(QUIZ, { b2b: 'nie' }, false).t).toBe('Konsumenci')
  })

  it('over the limit → already now; under → until 31 December', () => {
    expect(ksefQuizResult(QUIZ, { b2b: 'tak', lim: 'nad' }, false).t).toBe('Już teraz')
    expect(ksefQuizResult(QUIZ, { b2b: 'tak', lim: 'pod' }, false).t).toBe('Do 31 grudnia')
  })

  it('the first option of each question is the default', () => {
    expect(ksefQuizResult(QUIZ, {}, false).t).toBe('Do 31 grudnia')
  })

  it('invoices for receipts add the register note before the switch only', () => {
    expect(ksefQuizResult(QUIZ, { kasa: 'tak' }, false).l).toContain(QUIZ.results.registerNote)
    expect(ksefQuizResult(QUIZ, { kasa: 'tak' }, true).l).not.toContain(QUIZ.results.registerNote)
  })

  it('after the switch a firm issuing invoices for firms is in KSeF', () => {
    expect(ksefQuizResult(QUIZ, { b2b: 'tak' }, true).t).toBe('W KSeF')
    expect(ksefQuizResult(QUIZ, { b2b: 'nie' }, true).t).toBe('Konsumenci')
  })
})
