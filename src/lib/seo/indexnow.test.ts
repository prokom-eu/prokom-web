import { existsSync, readFileSync } from 'node:fs'
import path from 'node:path'

import { describe, expect, it } from 'vitest'

import { INDEXNOW_KEY } from './indexnow'

describe('IndexNow key (ADR-030)', () => {
  it('is 32 lowercase hex characters (protocol: 8–128 of a-z, A-Z, 0-9, -)', () => {
    expect(INDEXNOW_KEY).toMatch(/^[0-9a-f]{32}$/)
  })

  it('has a key file route whose folder name is the key', () => {
    const route = path.join('src', 'app', '(sites)', '[domain]', `${INDEXNOW_KEY}.txt`, 'route.ts')
    expect(existsSync(route)).toBe(true)
  })

  it('is the key the submit script sends (scripts/server/indexnow.py)', () => {
    expect(readFileSync(path.join('scripts', 'server', 'indexnow.py'), 'utf8')).toContain(
      `KEY = "${INDEXNOW_KEY}"`,
    )
  })
})
