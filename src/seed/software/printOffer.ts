import oknoOferty from '../../../seed/prokomsoftware/okno-oferty.json'
import { softwareOfferSchema } from '../../lib/software/offer'

/**
 * `pnpm software:offer-json`: the value of `SoftwareSettings.offer` (texts of the offer window,
 * SWR3), to paste in the panel where the seed is blocked (staging, production). Checked against
 * the schema the panel uses on save; prints nothing else, so the output can go straight to a file.
 */
const checked = softwareOfferSchema.safeParse(oknoOferty)
if (!checked.success) {
  console.error(checked.error.issues[0])
  process.exit(1)
}
process.stdout.write(`${JSON.stringify(oknoOferty, null, 2)}\n`)
process.exit(0)
