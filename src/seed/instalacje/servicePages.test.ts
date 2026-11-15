import { describe, expect, it } from 'vitest'

import { SERVICE_SECTION_IDS } from '../../lib/instalacje/anchors'
import { SERVICE_PAGE_KEYS } from './servicePages'

describe('SERVICE_PAGE_KEYS', () => {
  it('lists every service page built in code (add the key here with the page)', () => {
    expect([...SERVICE_PAGE_KEYS].sort()).toEqual(Object.keys(SERVICE_SECTION_IDS).sort())
  })
})
