import { describe, expect, it } from 'vitest'

import { readContact } from './contact'

// Spec §5 `ContactForm`: one field „Telefon lub e-mail” that recognises what was typed — a Polish
// number of 9 digits or an e-mail. The same check serves the special forms of the lines (L2).
describe('readContact', () => {
  it('reads a Polish number in the usual ways', () => {
    for (const typed of [
      '600 100 200',
      '600-100-200',
      '600100200',
      '+48 600 100 200',
      '0048600100200',
    ]) {
      expect(readContact(typed), typed).toEqual({ kind: 'phone', phone: typed.trim() })
    }
  })

  it('reads an e-mail', () => {
    expect(readContact(' jan@firma.pl ')).toEqual({ kind: 'email', email: 'jan@firma.pl' })
  })

  it('tells a wrong number from a wrong e-mail, for the right message', () => {
    expect(readContact('600 100')).toEqual({ kind: 'invalid', looksLike: 'phone' })
    expect(readContact('jan@firma')).toEqual({ kind: 'invalid', looksLike: 'email' })
    expect(readContact('Jan')).toEqual({ kind: 'invalid', looksLike: 'email' })
  })

  it('nothing typed → empty', () => {
    expect(readContact('   ')).toEqual({ kind: 'empty' })
  })
})
