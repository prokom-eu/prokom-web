import { z } from 'zod'

import {
  factKeys,
  faqItem,
  firstIssue,
  key,
  lineKey,
  nextItem,
  noContactData,
  text,
  titled,
} from './schema'

/*
 * Texts of `/dla-domu` (spec §6.4, board 04 `DlaDomu.dc.html`) as JSON in `HubSettings.forHome`
 * (ADR-H002 „Rozstrzygnięcia H1” pkt 8). A v1.1 page: shown only with `HubSettings.pages.forHome`.
 * Situations are records of `HubPlans` (type `sytuacja-dom`); phones, promises, the salon address
 * and hours come from the panels; the FAQ may use `{telefon}`, `{adres}`, `{godziny}`.
 */
const head = { eyebrow: text(80), title: text(120) }
const homeLine = z.enum(['instalacje', 'tech', 'gaming', 'software'])

export const forHomeSchema = z
  .object({
    hero: z.object({
      ...head,
      lead: text(400),
      choose: text(40),
      facts: z.array(z.object({ value: text(30), label: text(80), facts: factKeys })).max(5),
      trio: z
        .array(
          z.object({
            line: homeLine,
            title: text(60),
            text: text(200),
            anchor: z.enum(['#przekroj', '#linie-dom']),
          }),
        )
        .max(3),
    }),
    situations: z.object({
      ...head,
      lead: text(240),
      planFor: text(30),
      start: text(40),
      call: text(30),
      describe: text(40),
      note: text(120),
    }),
    scene: z.object({
      ...head,
      inArea: text(30),
      steps: text(30),
      items: z
        .array(
          z.object({
            line: homeLine,
            short: text(60),
            title: text(80),
            lead: text(300),
            cta: text(40),
            steps: z.array(text(90)).length(3),
            services: z.array(titled).min(1).max(8),
          }),
        )
        .min(1)
        .max(3),
    }),
    section: z.object({
      ...head,
      lead: text(200),
      why: text(30),
      when: text(30),
      note: text(80),
      cta: text(40),
      points: z
        .array(
          z.object({
            name: text(40),
            where: text(40),
            what: text(160),
            why: text(160),
            when: text(160),
          }),
        )
        .min(1)
        .max(12),
    }),
    topics: z.object({
      ...head,
      items: z
        .array(
          z.object({
            name: text(30),
            short: text(40),
            eyebrow: text(60),
            title: text(90),
            lead: text(300),
            note: text(200),
            cta: text(60),
            tiles: z
              .array(z.object({ label: text(30), title: text(40), text: text(160) }))
              .min(1)
              .max(12),
          }),
        )
        .min(1)
        .max(6),
    }),
    together: z.object({
      ...head,
      lead: text(240),
      cta: text(40),
      pillars: z.array(text(60)).max(3),
      examples: z
        .array(
          z.object({
            key,
            tab: text(30),
            node: text(40),
            title: text(90),
            groups: z
              .array(z.object({ line: lineKey, points: z.array(text(80)).min(1).max(6) }))
              .min(1)
              .max(4),
          }),
        )
        .min(1)
        .max(4),
    }),
    care: z.object({
      ...head,
      items: z.array(z.object({ line: homeLine, value: text(30), text: text(160) })).max(4),
      salon: text(30),
      remote: text(40),
      remoteNote: text(60),
      extras: z.array(text(40)).max(6),
      directions: text(40),
    }),
    faq: z.object({
      ...head,
      helpLink: text(40),
      items: z.array(faqItem).min(1).max(12),
    }),
    form: z.object({
      ...head,
      afterLabel: text(120),
      after: z.array(text(80)).max(4),
      cta: text(40),
    }),
    next: z.object({ ...head, items: z.array(nextItem).min(1).max(6) }),
    final: z.object({
      title: text(120),
      lines: z
        .array(z.object({ line: homeLine, what: text(80) }))
        .min(1)
        .max(4),
      directions: text(40),
    }),
  })
  .strict()
  .superRefine(noContactData)

export type HubForHome = z.infer<typeof forHomeSchema>

export function validateForHome(value: unknown): true | string {
  return firstIssue(forHomeSchema, value, 'Dla domu')
}
