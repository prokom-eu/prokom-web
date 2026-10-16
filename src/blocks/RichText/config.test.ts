import { describe, expect, it } from 'vitest'

import { validateRichTextUrl } from './config'

describe('validateRichTextUrl', () => {
  it.each(['/kontakt', 'https://pro-kom.eu', 'mailto:biuro@example.test', 'tel:+48000000000'])(
    'accepts %s',
    (url) => {
      expect(validateRichTextUrl(url, { linkType: 'custom' })).toBe(true)
    },
  )

  it.each(['javascript:alert(1)', 'http://example.com', '//evil.example', '', undefined])(
    'rejects %j',
    (url) => {
      expect(validateRichTextUrl(url, { linkType: 'custom' })).not.toBe(true)
    },
  )
})
