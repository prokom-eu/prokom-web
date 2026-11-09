import { describe, expect, it } from 'vitest'

import { stripBold } from '../../lib/site/emphasis'
import { softwareWizardSchema } from '../../lib/software/wizard/schema'
import { WIZARD_V3 } from '../../seed/software/wizard'
import { WIZARD_V3_FROZEN } from './software_wizard_v3'

describe('frozen wizard v3 of the migration swa3_kreator_v3', () => {
  it('fits the v3 schema, so the migrated wizard shows', () => {
    expect(softwareWizardSchema.safeParse(WIZARD_V3_FROZEN).error?.issues).toBeUndefined()
  })

  it('was copied from the seed of 08.11 (the seed may move on later, the copy must not)', () => {
    expect(WIZARD_V3_FROZEN.types.map((type) => type.solution)).toEqual(
      WIZARD_V3.types.map((type) => type.solution),
    )
    // The live card starts with the board's kind; the page keeps its eyebrows (SWA3b-2 review).
    expect(WIZARD_V3_FROZEN.defaultType).toBe(WIZARD_V3.defaultType)
    // The seed later marked the highlighted word (`**…**`, AUDYT-0911 #1); the words are the same.
    expect(WIZARD_V3_FROZEN.page).toEqual({
      ...WIZARD_V3.page,
      stepsTitle: stripBold(WIZARD_V3.page.stepsTitle),
    })
  })
})
