import { describe, expect, it } from 'vitest'

import { contactToastText } from './ContactToast'

// SWV7: a tap on a phone or e-mail link gets a short confirmation.

describe('contactToastText', () => {
  it('names the number and the address, nothing for other links', () => {
    expect(contactToastText('tel:+48883200151')).toBe('Łączę z numerem +48883200151')
    expect(contactToastText('mailto:kontakt@prokomsoftware.pl?subject=x')).toBe(
      'Otwieram e-mail do kontakt@prokomsoftware.pl',
    )
    expect(contactToastText('/kontakt')).toBeNull()
    expect(contactToastText('tel:%E0%A4%A')).toBe('Łączę z numerem %E0%A4%A')
  })
})
