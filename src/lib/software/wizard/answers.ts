import { z } from 'zod'

import { key } from '../schema'
import { prune, summaryOf, typeOf, type WizardAnswers } from './flow'
import { type SoftwareWizard, WIZARD_PICKS, type WizardPick } from './schema'

/**
 * Server side of wizard v3 (ADR-014 SW7 doprecyzowanie 3, ZMIANY-v24 §7.2): the browser sends only
 * the answers; the server checks them against the tenant's rules and writes the inquiry record.
 * Anything the rules would not let the wizard produce is rejected, not silently dropped.
 */

const free = (max: number) => z.string().trim().max(max)

const answersShape = z.strictObject({
  type: key.nullable(),
  industry: key.nullable(),
  picks: z.partialRecord(z.enum(WIZARD_PICKS), z.array(key).max(12)),
  size: key.nullable(),
  url: free(200),
  description: free(1500),
  note: free(1500),
})

/** Answers that fit the rules, or `null`. */
export function parseWizardAnswers(wizard: SoftwareWizard, value: unknown): WizardAnswers | null {
  const parsed = answersShape.safeParse(value)
  if (!parsed.success) return null
  const picks: WizardAnswers['picks'] = {}
  for (const [pick, ids] of Object.entries(parsed.data.picks) as [WizardPick, string[]][]) {
    if (new Set(ids).size !== ids.length) return null
    const exclusive = wizard.exclusive[pick]
    if (exclusive && ids.includes(exclusive) && ids.length > 1) return null
    if (ids.length) picks[pick] = ids
  }
  const answers: WizardAnswers = { ...parsed.data, picks }
  if (!typeOf(wizard, answers)) return null
  return sameAnswers(prune(wizard, answers), answers) ? answers : null
}

/** Plain comparison (no `node:util`: the folder is shared with the client). */
function sameAnswers(a: WizardAnswers, b: WizardAnswers): boolean {
  const scalars = ['type', 'industry', 'size', 'url', 'description', 'note'] as const
  if (scalars.some((field) => a[field] !== b[field])) return false
  return WIZARD_PICKS.every((pick) => (a.picks[pick] ?? []).join() === (b.picks[pick] ?? []).join())
}

/**
 * `Inquiries.wizard`: the answers named in Polish, flat and in step order — the mail prints one
 * line per key (`lib/inquiry/emails.ts`), the office reads them without the panel. One answer
 * (the industry, the team size) is a text, ticks are a list; the client's own words go only to
 * the message.
 */
export function wizardRecord(
  wizard: SoftwareWizard,
  answers: WizardAnswers,
): Record<string, string | string[]> {
  const { summary } = wizard
  const record: Record<string, string | string[]> = {}
  const type = typeOf(wizard, answers)
  if (type) record[summary.type] = type.label
  for (const row of summaryOf(wizard, answers)) {
    const single = row.label === summary.industry || row.label === summary.size
    record[row.label] = single ? (row.values[0] ?? '') : row.values
  }
  if (answers.url) record[summary.url] = answers.url
  return record
}

/** `Inquiries.message`: „Kreator: <rodzaj>”, then the client's own words. */
export function wizardMessage(wizard: SoftwareWizard, answers: WizardAnswers): string {
  const head = wizard.send.messageTemplate.replace('{rodzaj}', typeOf(wizard, answers)?.label ?? '')
  return [head, answers.description, answers.note].filter(Boolean).join('\n\n')
}
