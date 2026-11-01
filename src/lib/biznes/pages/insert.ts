import { z } from 'zod'

import { plural } from '../../plural'

const text = z.string().trim().min(1)
const slug = z.string().trim().min(1).max(120)

export const programQuestionSchema = z.object({
  q: text,
  options: z
    .array(z.object({ t: text, k: text }))
    .min(2)
    .max(4),
})
export type ProgramQuestion = z.infer<typeof programQuestionSchema>

export const programRuleSchema = z.object({
  /** Answer keys that must all be picked; `[]` = the fallback rule (last). */
  when: z.array(text),
  slug,
  why: text,
})
export type ProgramRule = z.infer<typeof programRuleSchema>

/** `insert-hero`: the program boxes and three badges; the H1 and lead are the block's fields. */
export const insertHeroSchema = z.object({
  /** Breadcrumbs between „Strona główna” and the page (board: Start / Oferta / GoPOS). */
  trail: z
    .array(z.object({ name: text, href: text }))
    .max(2)
    .default([]),
  pill: text,
  boxes: z.array(z.object({ slug, name: text })).max(8),
  badges: z.array(text).max(3),
  actions: z.array(z.object({ label: text, href: text })).max(2),
})

/** `insert-picker` (#ktory): „Który Subiekt dla mnie?”. */
export const insertPickerSchema = z.object({
  questions: z.array(programQuestionSchema).min(1).max(4),
  rules: z.array(programRuleSchema).min(1).max(8),
})

/** `insert-ksef` (#ksef): timeline, the six steps and the actions. */
export const insertKsefSchema = z.object({
  /** End of the transition period: the day counter counts to it (ISO date). */
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  timeline: z.array(z.object({ d: text, t: text, s: text })).max(4),
  checklist: z.array(z.object({ t: text, d: text })).max(8),
  ksefSlug: slug,
  pointsSlug: slug,
})

/** `insert-points` (#inspunkty): how InsPunkty work and the calculator. */
export const insertPointsSchema = z.object({
  slug,
  pool: z.number().int().min(0),
  defaults: z.tuple([z.number().int().min(0), z.number().int().min(0)]),
  presets: z
    .array(
      z.object({ t: text, sales: z.number().int().min(0), purchases: z.number().int().min(0) }),
    )
    .max(4),
  steps: z.array(z.object({ t: text, d: text })).max(6),
  notes: z.array(z.object({ t: text, d: text })).max(4),
  rules: z.array(z.object({ t: text, d: text })).max(6),
  rulesSource: z.string().optional(),
})

/** `insert-requirements`: computer for Subiekt nexo. */
export const insertRequirementsSchema = z.object({
  minimum: z.array(z.object({ k: text, v: text })).max(6),
  recommended: z.array(z.object({ k: text, v: text })).max(6),
  computers: z.array(slug).max(3),
})

/** The program for the answers (index per question; missing or out of range = the first). */
export function pickProgram(
  questions: readonly ProgramQuestion[],
  rules: readonly ProgramRule[],
  answers: readonly number[],
): ProgramRule {
  const keys = questions.map((question, i) => {
    const answer = answers[i] ?? 0
    return (question.options[answer] ?? question.options[0])!.k
  })
  return (
    rules.find((rule) => rule.when.every((key) => keys.includes(key))) ?? rules[rules.length - 1]!
  )
}

/** ± buttons of the calculator change the number of invoices by this much. */
export const INSPOINTS_STEP = 5

/** One InsPunkt per invoice sent to or fetched from KSeF. */
export function insPointsUsage(sales: number, purchases: number) {
  const month = Math.max(0, sales) + Math.max(0, purchases)
  return { month, year: month * 12 }
}

/** „4 440” with a non-breaking space between thousands. */
export const formatPoints = (n: number) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ' ')

export const insPointsLabel = (n: number) =>
  `${formatPoints(n)} ${plural(n, ['InsPunkt', 'InsPunkty', 'InsPunktów'])}`

/** How long the pool from the Abonament lasts at this usage; `null` with no invoices. */
export function poolCoverage(pool: number, perMonth: number): string | null {
  if (perMonth <= 0) return null
  const months = pool / perMonth
  if (months >= 12) return 'cały rok'
  if (months < 1) return 'mniej niż miesiąc'
  return `ok. ${String(Math.round(months * 10) / 10).replace('.', ',')} miesiąca`
}

/** Note of the „Zapytaj o paczkę InsPunktów” position. */
export const insPointsNote = (perMonth: number) => `InsPunkty: ${perMonth} / mies.`
