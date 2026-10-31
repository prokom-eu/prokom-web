import { describe, expect, it } from 'vitest'

import { sentNumber, sentVia } from './wyslane'

describe('/wyslane parameters', () => {
  it('takes only an Instalacje inquiry number', () => {
    expect(sentNumber('PKI-2026-0007')).toBe('PKI-2026-0007')
    expect(sentNumber(['PKI-2026-12345', 'x'])).toBe('PKI-2026-12345')
    expect(sentNumber('PKS-2026-0007')).toBeNull()
    expect(sentNumber('<b>PKI</b>')).toBeNull()
    expect(sentNumber(undefined)).toBeNull()
  })

  it('names the contact way, nothing else', () => {
    expect(sentVia('whatsapp')).toBe('na WhatsAppie')
    expect(sentVia('toString')).toBeNull()
    expect(sentVia(undefined)).toBeNull()
  })
})
