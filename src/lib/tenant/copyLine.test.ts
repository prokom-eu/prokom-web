import { describe, expect, it } from 'vitest'

import { notOnLine, onLine } from './copyLine'

describe('line conditions of the panel', () => {
  it('shows the fields of a line only on that line', () => {
    expect(onLine('software')({ line: 'software' })).toBe(true)
    expect(onLine('software')({ line: 'biznes' })).toBe(false)
    expect(onLine('software')({})).toBe(false)
    expect(onLine('software')(undefined)).toBe(false)
  })

  it('hides the shared Biznes fields only once the document is on the other line', () => {
    expect(notOnLine('software')({ line: 'biznes' })).toBe(true)
    expect(notOnLine('software')({})).toBe(true)
    expect(notOnLine('software')({ line: 'software' })).toBe(false)
  })
})
