import { describe, expect, it } from 'vitest'

import { routeUrl } from './route'

describe('routeUrl', () => {
  it('the panel link first', () => {
    expect(routeUrl('https://maps.example/trasa', 'ul. Orkana 16B')).toBe(
      'https://maps.example/trasa',
    )
  })

  it('built from the address when the panel has none', () => {
    expect(routeUrl(null, 'ul. Orkana 16B, 34-700 Rabka-Zdrój')).toBe(
      'https://www.google.com/maps/dir/?api=1&destination=ul.%20Orkana%2016B%2C%2034-700%20Rabka-Zdr%C3%B3j',
    )
  })

  it('null without both', () => {
    expect(routeUrl(' ', null)).toBeNull()
  })
})
