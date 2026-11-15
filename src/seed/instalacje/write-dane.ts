/**
 * Writes `src/sites/instalacje/dane/nawigacja.ts` from the design package — once (ADR-I002 §5):
 * afterwards the file is edited by hand, so an existing file is kept unless `--force`.
 * Run: `pnpm payload run src/seed/instalacje/write-dane.ts [--force]`.
 */
import { existsSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { format, resolveConfig } from 'prettier'

import { navigationData } from './dane'

const target = path.resolve(process.cwd(), 'src/sites/instalacje/dane/nawigacja.ts')
if (existsSync(target) && !process.argv.includes('--force')) {
  console.log(`Kept ${path.relative(process.cwd(), target)} — edited by hand; --force overwrites.`)
} else {
  const source = `/**
 * Menus of the Instalacje site: column order, phone bottom bar, „Więcej”, header CTA.
 * Generated once from \`seed/prokominstalacje/wspolne.json\` (\`src/seed/instalacje/write-dane.ts\`);
 * edit here from now on. Names, icons and colours of services and objects: the panel, by key.
 */
import type { Navigation } from './types'

export const navigation: Navigation = ${JSON.stringify(navigationData())}
`
  const options = await resolveConfig(target)
  writeFileSync(target, await format(source, { ...options, filepath: target }))
  console.log(`Wrote ${path.relative(process.cwd(), target)}.`)
}
