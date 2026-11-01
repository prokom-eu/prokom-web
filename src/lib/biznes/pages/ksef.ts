import { z } from 'zod'

import { warsawDayOf } from '../../site/days'

// KSeF page (K4j, K35 §2, K36 §3, ADR-017 D-K4-7): texts in two versions, switched on the „od
// daty” day in Polish time; `?ksefpo=1` shows the later version before the date (board and e2e).

const text = z.string().trim().min(1)
const slug = z.string().trim().min(1).max(120)
const isoDay = z.string().regex(/^\d{4}-\d{2}-\d{2}$/)

/** The day the texts switch (ISO date, the start of that day in Poland). */
export function isAfterSwitch(date: string, now: Date, search = ''): boolean {
  if (/(?:^|[?&])ksefpo=1(?:&|$)/.test(search)) return true
  const target = Date.parse(`${date}T00:00:00Z`)
  if (Number.isNaN(target)) return false
  return warsawDayOf(now) >= target
}

export type TimelineStatus = 'obowiązuje' | 'następne' | 'wkrótce'

/** Status of a timeline point: in force once its day has come, the first one ahead is next. */
export function timelineStatus(dates: readonly string[], i: number, now: Date): TimelineStatus {
  const passed = (date: string) => isAfterSwitch(date, now)
  if (passed(dates[i]!)) return 'obowiązuje'
  const next = dates.findIndex((date) => !passed(date))
  return i === next ? 'następne' : 'wkrótce'
}

const versionSchema = z.object({ h1a: text, h1b: text, lead: text })

/** `ksef-hero`: both versions of the H1 and lead, the switch day, the counter, the timeline. */
export const ksefHeroSchema = z.object({
  trail: z
    .array(z.object({ name: text, href: text }))
    .max(2)
    .default([]),
  pill: text,
  switchDate: isoDay,
  before: versionSchema,
  after: versionSchema,
  timeline: z
    .array(z.object({ date: isoDay, d: text, t: text, s: text }))
    .min(1)
    .max(6),
  ask: z.object({ slug, label: text, note: text }),
})

const resultSchema = z.object({ t: text, l: z.array(text).max(3) })

export const ksefQuizSchema = z.object({
  switchDate: isoDay,
  questions: z
    .array(
      z.object({
        key: z.enum(['b2b', 'lim', 'kasa']),
        t: text,
        /** Asked before the switch only (the 10 000 zł limit ends with it). */
        beforeOnly: z.boolean().optional(),
        options: z.array(z.object({ k: text, n: text })).length(2),
      }),
    )
    .min(1)
    .max(4),
  results: z.object({
    consumer: resultSchema,
    now: resultSchema,
    soon: resultSchema,
    after: resultSchema,
    registerNote: text,
  }),
})
export type KsefQuiz = Omit<z.infer<typeof ksefQuizSchema>, 'switchDate'>

/** Questions shown in the phase: the limit question goes after the switch. */
export const visibleQuestions = (quiz: KsefQuiz, after: boolean) =>
  quiz.questions.filter((question) => !(after && question.beforeOnly))

/** Result of the quiz; a question not answered counts as its first option. */
export function ksefQuizResult(
  quiz: KsefQuiz,
  answers: Readonly<Record<string, string>>,
  after: boolean,
): { t: string; l: string[] } {
  const pick = (key: string) =>
    answers[key] ?? quiz.questions.find((question) => question.key === key)?.options[0]?.k
  const { results } = quiz
  if (pick('b2b') === 'nie') return { t: results.consumer.t, l: [...results.consumer.l] }
  if (after) return { t: results.after.t, l: [...results.after.l] }
  const base = pick('lim') === 'nad' ? results.now : results.soon
  const lines = [...base.l]
  if (pick('kasa') === 'tak') lines.push(results.registerNote)
  return { t: base.t, l: lines }
}

/** `ksef-steps`: 6 steps with a progress kept in the browser (`storageKey`). */
export const ksefStepsSchema = z.object({
  storageKey: z.string().regex(/^[a-z0-9-]{3,40}$/),
  steps: z
    .array(z.object({ t: text, d: text, w: text }))
    .min(1)
    .max(8),
})

/** `ksef-penalties`: penalties in both versions and how we help, with three products. */
export const ksefPenaltiesSchema = z.object({
  switchDate: isoDay,
  penalties: z.object({
    eyebrow: text,
    heading: text,
    figures: z.array(z.object({ v: text, k: text })).max(3),
    text,
    before: text,
    after: text,
  }),
  help: z.object({
    eyebrow: text,
    heading: text,
    items: z.array(z.object({ t: text, d: text })).max(6),
    products: z.array(slug).max(4),
    link: z.object({ label: text, href: text }),
  }),
})
