import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

import { hasSameValues } from '../compare'
import type { PageBlock } from './page'

/**
 * One-off replacement of stored pages with the seed's layout (NAPRAWA-0911, runbook §2a).
 * The seed never overwrites a page that looks edited in the panel; a database whose pages
 * predate the current seed (staging: GoPOS, InsERT, Opieka IT, O firmie, Kontakt from the
 * 31.10 import) therefore keeps its old layouts. Named pages are replaced:
 *   pnpm seed:biznes -- --zamien-strony=gopos,insert,opieka-it,o-firmie,kontakt
 *   ZAMIEN_STRONY=gopos,insert … (how scripts/staging-content.sh passes it on)
 * Nothing named = nothing replaced.
 */
export function pagesToReplace(
  argv: readonly string[] = process.argv,
  env: Readonly<Record<string, string | undefined>> = process.env,
): ReadonlySet<string> {
  const flag = argv.find((arg) => arg.startsWith('--zamien-strony='))
  const value = flag ? flag.slice('--zamien-strony='.length) : env.ZAMIEN_STRONY
  return new Set(
    (value ?? '')
      .split(',')
      .map((slug) => slug.trim())
      .filter(Boolean),
  )
}

/** Block types in order — what „the same layout” means for a repeated run. */
export const blockTypes = (layout: readonly PageBlock[] | null | undefined): string[] =>
  (layout ?? []).map((block) => block.blockType)

/**
 * The stored page already has the seed's blocks with the seed's values (a second run changes
 * nothing). Values, not only block types (PREMIUM-1011): K4 pages are all `bzSection` blocks, so a
 * new variant, surface or section data would otherwise never reach a replaced page. Keys the seed
 * does not set (row ids, panel-only fields) are ignored (`hasSameValues`).
 */
export const hasSeedLayout = (
  stored: readonly PageBlock[] | null | undefined,
  seed: readonly PageBlock[],
): boolean =>
  blockTypes(stored).join(' ') === blockTypes(seed).join(' ') && hasSameValues(stored, seed)

/** „4 bloki (bzOrderFlow, bzTimeline, faq, bzContact)” — for the report „przed → po”. */
export function describeLayout(layout: readonly PageBlock[] | null | undefined): string {
  const types = blockTypes(layout)
  const counts = new Map<string, number>()
  for (const type of types) counts.set(type, (counts.get(type) ?? 0) + 1)
  const list = [...counts].map(([type, n]) => (n > 1 ? `${type}×${n}` : type)).join(', ')
  return `${types.length} bl. (${list || '—'})`
}

/**
 * Saves the old layout before a replacement: `tmp/strony-backup-<date>.json` in the working
 * folder (git-ignored), one entry per page and run — layouts only, no personal data.
 */
export function backupLayout(
  slug: string,
  layout: readonly PageBlock[] | null | undefined,
  dir = join(process.cwd(), 'tmp'),
  now = new Date(),
): string {
  mkdirSync(dir, { recursive: true })
  const file = join(dir, `strony-backup-${now.toISOString().slice(0, 10)}.json`)
  let entries: unknown[] = []
  try {
    entries = JSON.parse(readFileSync(file, 'utf8')) as unknown[]
  } catch {
    entries = []
  }
  entries.push({ slug, savedAt: now.toISOString(), layout: layout ?? [] })
  writeFileSync(file, `${JSON.stringify(entries, null, 2)}\n`)
  return file
}
