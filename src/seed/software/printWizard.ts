import kreator from '../../../seed/prokomsoftware/kreator.json'
import { softwareWizardSchema } from '../../lib/software/wizard'
import { wizardSeed } from './wizardExtras'

/**
 * `pnpm software:wizard-json`: the value of `SoftwareSettings.wizard` in the v22 shape, to paste
 * in the panel where the seed is blocked (staging, production). Checked against the schema the
 * panel uses on save; prints nothing else, so the output can go straight to a file.
 */
const value = wizardSeed(kreator)
const checked = softwareWizardSchema.safeParse(value)
if (!checked.success) {
  console.error(checked.error.issues[0])
  process.exit(1)
}
process.stdout.write(`${JSON.stringify(value, null, 2)}\n`)
process.exit(0)
