import { describe, expect, it } from 'vitest'

import { splitDots, splitSentence, splitTime } from './textParts'

describe('splitTime', () => {
  it('finds the time of a callback promise', () => {
    expect(splitTime('Oddzwaniamy w ciągu 60 minut')).toEqual([
      'Oddzwaniamy w ciągu ',
      '60 minut',
      '',
    ])
    expect(splitTime('Oddzwonimy w 60 min w godzinach pracy')).toEqual([
      'Oddzwonimy w ',
      '60 min',
      ' w godzinach pracy',
    ])
    expect(splitTime('Odpowiadamy w 24 h')).toEqual(['Odpowiadamy w ', '24 h', ''])
  })

  it('gives null without a time, and never takes letters for digits', () => {
    expect(splitTime('Oddzwaniamy z wyceną')).toBeNull()
    expect(splitTime('dh dzwonimy')).toBeNull()
    expect(splitTime('Wycena w 2 hurtowniach')).toBeNull()
  })
})

describe('splitSentence', () => {
  it('splits the second sentence off', () => {
    expect(splitSentence('Napisz, czego potrzebujesz. Oddzwonimy w ciągu 60 minut.')).toEqual([
      'Napisz, czego potrzebujesz.',
      'Oddzwonimy w ciągu 60 minut.',
    ])
    expect(splitSentence('Nie wiesz, co wybrać? Zadzwoń.')).toEqual([
      'Nie wiesz, co wybrać?',
      'Zadzwoń.',
    ])
  })

  it('keeps one sentence and abbreviations in one piece', () => {
    expect(splitSentence('Powiedz, czego potrzebujesz')).toEqual([
      'Powiedz, czego potrzebujesz',
      null,
    ])
    expect(splitSentence('Opisz potrzeby, np. kasa i terminal')).toEqual([
      'Opisz potrzeby, np. kasa i terminal',
      null,
    ])
  })
})

describe('splitDots', () => {
  it('splits a line of statuses whatever the spaces around the dots', () => {
    expect(
      splitDots('Autoryzowany serwis Posnet i Elzab · Autoryzowany partner GoPOS i InsERT'),
    ).toEqual(['Autoryzowany serwis Posnet i Elzab', 'Autoryzowany partner GoPOS i InsERT'])
    expect(splitDots('A·B  ·  C')).toEqual(['A', 'B', 'C'])
    expect(splitDots('')).toEqual([])
  })
})
