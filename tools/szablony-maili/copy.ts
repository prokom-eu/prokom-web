// pnpm szablony:copy [--to <dir>] — copies the built package (dist/) to the folder Thunderbird reads.
// Default: ../../maile next to the repos folder (on Krystian's computer: the PRO-KOM\maile folder).
import { cp, stat } from 'node:fs/promises'
import { join, resolve } from 'node:path'
import { parseArgs } from 'node:util'
import { DEFAULT_TARGET } from './build.ts'
import { TOOL_DIR } from './load.ts'

const { values } = parseArgs({ options: { to: { type: 'string' } } })
const from = join(TOOL_DIR, 'dist')
const to = resolve(values.to ?? DEFAULT_TARGET)

try {
  await stat(from)
} catch {
  console.error('Brak dist/ — najpierw: pnpm szablony:build')
  process.exit(1)
}
// Overwrites files of the same name; leaves other files (e.g. the v1 package) in place.
await cp(from, to, { recursive: true, force: true })
console.log(`Skopiowano dist/ → ${to}`)
