import { describe, expect, it } from 'vitest'

import { screenTitle } from './screenTitle'

describe('screenTitle', () => {
  it('keeps a short name', () => {
    expect(screenTitle('Kontakt')).toBe('Kontakt')
  })

  it('cuts at a dash or a colon', () => {
    expect(screenTitle('KSeF 2027 — co musi zrobić firma')).toBe('KSeF 2027')
    expect(screenTitle('Laptopy dla firm – Lenovo i Dell')).toBe('Laptopy dla firm')
    expect(screenTitle('GoPOS dla gastronomii: sala i kuchnia')).toBe('GoPOS dla gastronomii')
  })

  it('cuts at the end of the first sentence', () => {
    expect(screenTitle('Apple dla firm. iPhone, iPad i Mac')).toBe('Apple dla firm')
  })

  it('keeps hyphenated words and collapses spaces', () => {
    expect(screenTitle('  Wi-Fi   i sieć ')).toBe('Wi-Fi i sieć')
  })
})
