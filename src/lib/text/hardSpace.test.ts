import { describe, expect, it } from 'vitest'

import { hardSpaces, hardSpacesDeep } from './hardSpace'

const NBSP = String.fromCharCode(0xa0)

describe('hardSpaces (K4-FINAL §1)', () => {
  it('glues one-letter words to the next word', () => {
    expect(hardSpaces('szkolimy zespół w lokalu')).toBe(`szkolimy zespół w${NBSP}lokalu`)
    expect(hardSpaces('Z Rabki i z Zakopanego')).toBe(`Z${NBSP}Rabki i${NBSP}z${NBSP}Zakopanego`)
  })

  it('glues short numbers to their word', () => {
    expect(hardSpaces('to 1 InsPunkt')).toBe(`to 1${NBSP}InsPunkt`)
    expect(hardSpaces('od 2016 roku')).toBe('od 2016 roku')
  })

  it('leaves longer words and ids alone', () => {
    expect(hardSpaces('Sala, kuchnia i dowozy.')).toBe(`Sala, kuchnia i${NBSP}dowozy.`)
    expect(hardSpaces('gopos-kds')).toBe('gopos-kds')
    expect(hardSpaces('tel:+48889003889')).toBe('tel:+48889003889')
  })

  it('works through nested data', () => {
    expect(hardSpacesDeep({ a: ['w domu'], n: 3, b: null })).toEqual({
      a: [`w${NBSP}domu`],
      n: 3,
      b: null,
    })
  })
})
