import { describe, expect, it } from 'vitest'

import { isValidTitleTemplate } from './title'

describe('isValidTitleTemplate', () => {
  it('accepts a template with exactly one %s', () => {
    expect(isValidTitleTemplate('%s | PRO-KOM Biznes')).toBe(true)
  })

  it.each(['PRO-KOM Biznes', '%s | %s', '', '   '])('rejects %j', (value) => {
    expect(isValidTitleTemplate(value)).toBe(false)
  })
})
