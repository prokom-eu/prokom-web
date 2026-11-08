import { softwareWizardSchema } from '../../lib/software/wizard/schema'
import { WIZARD_V3 } from './wizard'

/**
 * `pnpm software:wizard-json`: the value of `SoftwareSettings.wizard` (v3), to paste in the panel
 * where the seed is blocked (staging, production). Checked against the schema the panel uses on
 * save; prints nothing else, so the output can go straight to a file.
 */
const checked = softwareWizardSchema.safeParse(WIZARD_V3)
if (!checked.success) {
  console.error(checked.error.issues[0])
  process.exit(1)
}
process.stdout.write(`${JSON.stringify(WIZARD_V3, null, 2)}
`)
process.exit(0)
