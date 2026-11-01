// Backgrounds of the Software solution thumbnails on papier (SWV1, ADR-015 v23 pkt 6,
// docs/design/prokomsoftware/ZMIANY-v23.md §3):
//   node scripts/software-thumbs.mjs           rewrites public/software/rozwiazania/*.svg
//   node scripts/software-thumbs.mjs --check   exit code 1 when a thumbnail still has an old colour
// Only the background gradient stops and the big decorative circle change; the mock-up inside
// the thumbnail stays as it is. Idempotent: the new colours are not old ones. Run it for every
// new thumbnail made from the v22 template. The functions are also used by a test (Vitest).
import { readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const FIRST_STOP = '#F2F3EF'
const SECOND_STOP = '#E3E6DE'
const CIRCLE = '#B9B0D6'

/** Old pastel colour of a category → its papier replacement (upper case, `#rrggbb`). */
export const THUMB_COLORS = Object.freeze({
  ...Object.fromEntries(
    ['#EFE9FC', '#E6EEFC', '#E4F3F1', '#FCF1E2', '#E7F4E2'].map((c) => [c, FIRST_STOP]),
  ),
  ...Object.fromEntries(
    ['#DCCEFA', '#CCDCF8', '#C9E7E2', '#F5DDBA', '#CDE8C3'].map((c) => [c, SECOND_STOP]),
  ),
  ...Object.fromEntries(
    ['#A98BF0', '#7EA6E6', '#5DB7AC', '#E6A65A', '#77BE66'].map((c) => [c, CIRCLE]),
  ),
})

const STOP = /(stop-color=['"])(#[0-9A-Fa-f]{6})(['"])/g
// The decorative circle of the template: `<circle … r='70' fill='#…'`.
const BIG_CIRCLE = /(r=['"]70['"]\s+fill=['"])(#[0-9A-Fa-f]{6})(['"])/g

/**
 * The SVG with papier backgrounds.
 * @param {string} svg
 * @returns {string}
 */
export function recolorThumb(svg) {
  /** @param {string} _ @param {string} head @param {string} color @param {string} tail */
  const swap = (_, head, color, tail) =>
    `${head}${THUMB_COLORS[color.toUpperCase()] ?? color}${tail}`
  return svg.replace(STOP, swap).replace(BIG_CIRCLE, swap)
}

function main() {
  // From the script's own place, so it works from any working directory.
  const dir = fileURLToPath(new URL('../public/software/rozwiazania/', import.meta.url))
  const check = process.argv.includes('--check')
  const stale = []
  for (const name of readdirSync(dir).filter((file) => file.endsWith('.svg'))) {
    const path = join(dir, name)
    const svg = readFileSync(path, 'utf8')
    const next = recolorThumb(svg)
    if (next === svg) continue
    stale.push(name)
    if (!check) writeFileSync(path, next)
  }
  if (check && stale.length > 0) {
    console.error(`Old thumbnail colours in: ${stale.join(', ')}`)
    process.exit(1)
  }
  console.log(check ? 'Thumbnails: OK' : `Thumbnails recoloured: ${stale.length}`)
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) main()
