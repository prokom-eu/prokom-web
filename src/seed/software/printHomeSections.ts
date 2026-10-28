import { homeSectionsSchema } from '../../lib/software/home'
import { HOME_SECTION_TEXTS } from './homeExtras'

/**
 * `pnpm software:home-sections-json`: the section headings of the start page (SW5) — the value of
 * the key `sections` in `SoftwareSettings.home`, to add in the panel where the seed is blocked
 * (staging, production). Checked against the schema the panel uses on save; prints nothing else.
 */
const checked = homeSectionsSchema.safeParse(HOME_SECTION_TEXTS)
if (!checked.success) {
  console.error(checked.error.issues[0])
  process.exit(1)
}
process.stdout.write(`${JSON.stringify(HOME_SECTION_TEXTS, null, 2)}\n`)
process.exit(0)
