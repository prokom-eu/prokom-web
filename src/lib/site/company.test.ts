import { describe, expect, it } from 'vitest'

import { isValidNip, isValidTime, normalizeNip, sortDays } from './company'

describe('normalizeNip', () => {
  it('strips separators and the PL prefix', () => {
    expect(normalizeNip('PL 123-456-32-18')).toBe('1234563218')
  })
})

describe('isValidNip', () => {
  it.each(['1234563218', '123-456-32-18', 'PL1234563218'])('accepts %j', (nip) => {
    expect(isValidNip(nip)).toBe(true)
  })

  it.each(['1234563219', '123', '52602502741', 'abcdefghij', ''])('rejects %j', (nip) => {
    expect(isValidNip(nip)).toBe(false)
  })
})

describe('isValidTime', () => {
  it.each(['00:00', '08:00', '23:59'])('accepts %j', (time) => {
    expect(isValidTime(time)).toBe(true)
  })

  it.each(['8:00', '24:00', '12:60', '12.00', ''])('rejects %j', (time) => {
    expect(isValidTime(time)).toBe(false)
  })
})

describe('sortDays', () => {
  it('orders days from Monday, whatever order they were picked in', () => {
    expect(sortDays(['sat', 'mon', 'fri', 'sun'])).toEqual(['mon', 'fri', 'sat', 'sun'])
  })
})
