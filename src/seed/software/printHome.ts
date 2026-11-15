import { homeSchema } from '../../lib/software/home'
import { softwareSettingsData } from './map'

/**
 * `pnpm software:home-json`: the whole value of `SoftwareSettings.home` as the seed writes it
 * (texts, „12 rzeczy”, section headings) — to paste in the panel where the seed is blocked
 * (staging, production) when its shape changes (SWR5: `popular.order` without generic cards).
 * Checked against the schema the panel uses on save; prints nothing else.
 */
const home = softwareSettingsData().home
const checked = homeSchema.safeParse(home)
if (!checked.success) {
  console.error(checked.error.issues[0])
  process.exit(1)
}
process.stdout.write(`${JSON.stringify(home, null, 2)}\n`)
process.exit(0)
