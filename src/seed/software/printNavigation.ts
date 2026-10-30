import nawigacja from '../../../seed/prokomsoftware/nawigacja.json'
import { navigationSchema } from '../../lib/software/navigation'

/**
 * `pnpm software:navigation-json`: the value of `SiteSettings.software.navigation` in the v21
 * shape (SWR2), to paste in the panel where the seed is blocked (staging, production). Checked
 * against the schema the panel uses on save; prints nothing else, so the output can go straight
 * to a file.
 */
const checked = navigationSchema.safeParse(nawigacja)
if (!checked.success) {
  console.error(checked.error.issues[0])
  process.exit(1)
}
process.stdout.write(`${JSON.stringify(nawigacja, null, 2)}\n`)
process.exit(0)
