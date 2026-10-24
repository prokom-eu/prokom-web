import { describe, expect, it } from 'vitest'

import { isBlockAllowed } from '../../blocks/registry'
import { biznesContactLayout } from './contact'

describe('biznesContactLayout (B8c)', () => {
  const layout = biznesContactLayout()

  it('uses only blocks of the Biznes line, with the form once (#kontakt)', () => {
    expect(layout.every((block) => isBlockAllowed('biznes', block.blockType))).toBe(true)
    expect(layout.filter((block) => block.blockType === 'bzContact')).toHaveLength(1)
  })

  it('has no remote help (only on /opieka-it, ZMIANY-v20 §1.2)', () => {
    expect(JSON.stringify(layout)).not.toMatch(/zdaln(ie|a) łącz|AnyDesk|TeamViewer/i)
  })
})
