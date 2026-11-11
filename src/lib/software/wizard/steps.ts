/**
 * The wizard's steps, groups and picks without `zod` (AUDYT-WYDAJNOSC-1111 #6): the wizard and the
 * pages read them in the browser, and `schema.ts` (with `zod`) stays on the server. `schema.ts`
 * re-exports them, so imports from there keep working.
 */

/** Groups of kinds — each asks its own questions (§7.1). */
export const WIZARD_GROUPS = ['site', 'redo', 'sys', 'auto', 'idk'] as const
export type WizardGroup = (typeof WIZARD_GROUPS)[number]

/** Steps the wizard knows how to draw; a group picks its own sequence. */
export const WIZARD_STEPS = [
  'type',
  'ind',
  'have',
  'feat',
  'redo',
  'fix',
  'today',
  'sysf',
  'auto',
  'desc',
  'res',
] as const
export type WizardStep = (typeof WIZARD_STEPS)[number]

/** Multiple-choice answers and the step that asks them. */
export const PICK_STEPS = {
  have: 'have',
  feat: 'feat',
  redo: 'redo',
  fix: 'fix',
  today: 'today',
  sysf: 'sysf',
  auto: 'auto',
  prog: 'auto',
  desc: 'desc',
} as const satisfies Record<string, WizardStep>
export type WizardPick = keyof typeof PICK_STEPS
export const WIZARD_PICKS = Object.keys(PICK_STEPS) as WizardPick[]

/** The team size — one answer, asked in the `sysf` step only (never for sites). */
export const SIZE_STEP: WizardStep = 'sysf'
/** The address of the current site — asked in the `redo` step. */
export const URL_STEP: WizardStep = 'redo'
/** „Opisz po swojemu” — the free text of the `desc` step. */
export const DESCRIPTION_STEP: WizardStep = 'desc'
