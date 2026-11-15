import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

import { describe, expect, it } from 'vitest'

/*
 * The hub's stylesheets share one bundle (`prokom.css`): two `@keyframes` with one name silently let
 * the last one win — a heading meant to slide in once faded in from zero (H13, `pk-rise`).
 */
const DIR = 'src/sites/prokom/style'

describe('hub keyframes', () => {
  it('every @keyframes name is defined once', () => {
    const names = readdirSync(DIR)
      .filter((file) => file.endsWith('.css'))
      .flatMap((file) =>
        [...readFileSync(join(DIR, file), 'utf8').matchAll(/@keyframes\s+([\w-]+)/g)].map(
          (match) => match[1],
        ),
      )
    const twice = names.filter((name, index) => names.indexOf(name) !== index)
    expect(twice).toEqual([])
  })
})
