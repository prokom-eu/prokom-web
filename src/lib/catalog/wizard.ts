import { z } from 'zod'

import { isSvgPath } from './svg'

/**
 * Rules of Konfigurator 3.0 (`/konfigurator`, K35 §1, ADR-017 D-K4-4), kept as one JSON value in
 * `BiznesSettings.wizard` (B1b decision: nested rules, rarely edited — a JSON field checked by
 * this schema instead of panel forms). Everything the board's engine reads is data here: kinds of
 * firm, situations, scales, needs with their product lists, presets, yes/no questions with the
 * needs they add and the products they put first, bundle groups and plan scenes. Products are
 * catalog slugs; the engine (`wizardEngine.ts`) skips those not listed on the site.
 */

const id = z.string().regex(/^[a-z0-9-]{1,40}$/, 'Identyfikator: małe litery, cyfry i myślniki.')
const text = (max: number) => z.string().trim().min(1).max(max)
const iconPath = z.string().max(400).refine(isSvgPath, 'Ikona: ścieżka SVG („d”).')
const slugs = z.array(id).max(12)

/** Scales of the board: 1 stanowisko, 2–3, 4–10, ponad 10 — the engine's rules read them. */
export const WIZARD_SCALES = ['1', '2', '4', '10'] as const
export type WizardScale = (typeof WIZARD_SCALES)[number]

/** Situations the engine knows (K35 §1.2 pkt 1 — `etap`). */
export const WIZARD_STAGES = ['nowa', 'wymiana', 'awaria', 'ksef'] as const
export type WizardStage = (typeof WIZARD_STAGES)[number]

/** Needs the engine adds by itself (situation, scale) — they must be in the list of needs. */
export const ENGINE_NEEDS = ['ksef', 'opieka', 'plat', 'kopie', 'ups'] as const

/** Where a result link of a need leads (`l` of the board): a brand, a page, the offer. */
export const WIZARD_LINK_KINDS = [
  'marka',
  'gopos',
  'insert',
  'oferta',
  'vending',
  'opieka',
] as const

const option = z.object({ id, name: text(60), caption: text(120) })

const question = z.object({
  id,
  question: text(120),
  caption: text(160),
  /** The usual answer, shown ticked (board: „Zaznaczyliśmy najczęstsze odpowiedzi”). */
  default: z.boolean(),
  add: z.array(id).max(8),
  /** Need → products put first when the answer is „Tak”. */
  overrides: z.record(id, slugs),
  /** Reason shown under the pick („Dopasowane, bo: dowozy i zamówienia online”). */
  tag: text(60),
})

const recommendation = z.object({
  title: text(80),
  why: text(400),
  /** Default list of the need. */
  products: slugs,
  byFirm: z.record(id, slugs),
  byScale: z.partialRecord(z.enum(WIZARD_SCALES), slugs),
  links: z
    .array(
      z.object({
        label: text(60),
        kind: z.enum(WIZARD_LINK_KINDS),
        /** `marka`: brand slug; `oferta`: category slug (empty = the whole offer). */
        target: z.string().max(60).optional(),
      }),
    )
    .max(4),
})

export const wizardSchema = z
  .object({
    version: z.literal(3),
    firms: z.array(option.extend({ iconPath })).min(1).max(12),
    stages: z.array(option.extend({ id: z.enum(WIZARD_STAGES) })).length(WIZARD_STAGES.length),
    scales: z.array(option.extend({ id: z.enum(WIZARD_SCALES) })).length(WIZARD_SCALES.length),
    /** Needs in the order of the result (board `ORD`). */
    needs: z
      .array(z.object({ id, name: text(60), iconPath }))
      .min(1)
      .max(24),
    presets: z.record(id, z.array(id).max(8)),
    recommendations: z.record(id, recommendation),
    questions: z.record(id, z.array(question).max(6)),
    /** Note on the result for a situation (board `etapNote`). */
    stageNotes: z.partialRecord(
      z.enum(WIZARD_STAGES),
      z.object({ title: text(80), text: text(400) }),
    ),
    /** Firm → bundle area (`Bundles.area`): the matching ready bundle. */
    bundleAreas: z.record(id, id),
    /** Firm → scene of „Plan Twojej firmy” (`FloorPlans.slug`). */
    scenes: z.record(id, id),
  })
  .superRefine((wizard, ctx) => {
    const firms = new Set(wizard.firms.map((firm) => firm.id))
    const needs = new Set(wizard.needs.map((need) => need.id))
    const issue = (path: (string | number)[], message: string) =>
      ctx.addIssue({ code: 'custom', path, message })
    const unique = (values: string[], path: string) => {
      if (new Set(values).size !== values.length) issue([path], 'Identyfikatory się powtarzają.')
    }
    unique([...firms], 'firms')
    unique(
      wizard.needs.map((need) => need.id),
      'needs',
    )
    for (const need of ENGINE_NEEDS) {
      if (!needs.has(need)) issue(['needs'], `Brak potrzeby „${need}” (dodaje ją silnik).`)
    }
    const knownFirm = (key: string, path: string) => {
      if (!firms.has(key)) issue([path, key], `Nieznany rodzaj firmy „${key}”.`)
    }
    const knownNeeds = (list: readonly string[], path: (string | number)[]) => {
      for (const need of list) if (!needs.has(need)) issue(path, `Nieznana potrzeba „${need}”.`)
    }
    for (const [firm, list] of Object.entries(wizard.presets)) {
      knownFirm(firm, 'presets')
      knownNeeds(list, ['presets', firm])
    }
    for (const [need, rec] of Object.entries(wizard.recommendations)) {
      knownNeeds([need], ['recommendations'])
      for (const firm of Object.keys(rec.byFirm)) knownFirm(firm, `recommendations.${need}.byFirm`)
    }
    for (const need of needs) {
      if (!wizard.recommendations[need]) issue(['recommendations'], `Brak listy dla „${need}”.`)
    }
    for (const [firm, list] of Object.entries(wizard.questions)) {
      knownFirm(firm, 'questions')
      unique(
        list.map((q) => q.id),
        `questions.${firm}`,
      )
      list.forEach((q, i) => {
        knownNeeds(q.add, ['questions', firm, i, 'add'])
        knownNeeds(Object.keys(q.overrides), ['questions', firm, i, 'overrides'])
      })
    }
    for (const firm of Object.keys(wizard.bundleAreas)) knownFirm(firm, 'bundleAreas')
    for (const firm of Object.keys(wizard.scenes)) knownFirm(firm, 'scenes')
  })

export type Wizard = z.infer<typeof wizardSchema>
export type WizardQuestion = z.infer<typeof question>
export type WizardRecommendation = z.infer<typeof recommendation>
export type WizardLinkKind = (typeof WIZARD_LINK_KINDS)[number]

/** `validate` of the JSON field: `true` or the first problem, readable in the panel. */
export function validateWizard(value: unknown): true | string {
  if (value === null || value === undefined) return true
  const result = wizardSchema.safeParse(value)
  if (result.success) return true
  const [issue] = result.error.issues
  return `Reguły konfiguratora: ${issue?.path.join('.') || '(całość)'} — ${issue?.message ?? 'błąd'}`
}
