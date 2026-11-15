import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

import { describe, expect, it } from 'vitest'

// SWA7: with `-webkit-backdrop-filter` next to `backdrop-filter` the CSS build dropped both, so
// the glass of the hero panel did not blur at all. The build adds the prefix itself where needed.
const DIR = join(process.cwd(), 'src/sites/software/style')

describe('Software CSS: glass', () => {
  it('no hand-written -webkit-backdrop-filter', () => {
    const files = readdirSync(DIR).filter((name) => name.endsWith('.css'))
    expect(files.length).toBeGreaterThan(0)
    for (const name of files) {
      expect(readFileSync(join(DIR, name), 'utf8'), name).not.toContain('-webkit-backdrop-filter')
    }
  })
})
