import { readdirSync, readFileSync } from 'node:fs'
import { join, relative } from 'node:path'

import { describe, expect, it } from 'vitest'

// Decision D10 (06.11.2026): no WhatsApp on any line — not in the view, the panel or the data.
// The seed is where data comes from, so no seed file of any line may carry it.

const ROOT = process.cwd()
const PATTERN = /whats\s?app|wa\.me/i

function filesUnder(dir: string, keep: (name: string) => boolean): string[] {
  return readdirSync(dir, { withFileTypes: true, recursive: true })
    .filter((entry) => entry.isFile() && keep(entry.name))
    .map((entry) => join(entry.parentPath, entry.name))
}

const SEED_FILES = [
  ...filesUnder(join(ROOT, 'seed'), (name) => name.endsWith('.json')),
  ...filesUnder(
    join(ROOT, 'src', 'seed'),
    (name) => name.endsWith('.ts') && !name.endsWith('.test.ts'),
  ),
]

describe('seed data of every line — no WhatsApp (D10)', () => {
  it('finds the seed files', () => {
    expect(SEED_FILES.length).toBeGreaterThan(10)
  })

  it('has no „WhatsApp” nor wa.me in any seed file', () => {
    const offending = SEED_FILES.filter((file) => PATTERN.test(readFileSync(file, 'utf8'))).map(
      (file) => relative(ROOT, file).replaceAll('\\', '/'),
    )
    expect(offending).toEqual([])
  })
})
