import { existsSync } from 'node:fs'
import { join } from 'node:path'

import { describe, expect, it } from 'vitest'

import { defaultOgImage } from './ogDefault'

describe('defaultOgImage (SWV8 P0 #4)', () => {
  it('gives Software its 1200×630 file from public/brand', () => {
    const image = defaultOgImage('software')
    expect(image).toMatchObject({ width: 1200, height: 630 })
    const url = image?.sources[0]?.url ?? ''
    expect(existsSync(join(process.cwd(), 'public', url))).toBe(true)
  })

  it('gives no image to a line without its own file, nor without a line', () => {
    expect(defaultOgImage('biznes')).toBeNull()
    expect(defaultOgImage(null)).toBeNull()
  })
})
