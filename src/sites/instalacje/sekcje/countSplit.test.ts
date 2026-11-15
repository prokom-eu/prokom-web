import { describe, expect, it } from 'vitest'

import { splitCount } from './countSplit'

describe('splitCount', () => {
  it('counts a bare figure and keeps its suffix', () => {
    expect(splitCount('100+')).toEqual({ prefix: '', count: '100+' })
    expect(splitCount('24 mies.')).toEqual({ prefix: '', count: '24 mies.' })
    expect(splitCount('10')).toEqual({ prefix: '', count: '10' })
  })

  it('keeps the words before the year still', () => {
    expect(splitCount('od 2004')).toEqual({ prefix: 'od ', count: '2004' })
  })

  it('leaves texts it cannot count as they are', () => {
    expect(splitCount('Rabka')).toBeNull()
    expect(splitCount('1 200+')).toBeNull()
    expect(splitCount('-5')).toBeNull()
    expect(splitCount('nr2')).toBeNull()
    expect(splitCount('')).toBeNull()
  })
})
