import { z } from 'zod'

import { firstIssue, lineKey, nextItem, noContactData, text } from './schema'

/*
 * Texts of `/linie` — „Cała oferta” (spec §6.2, board 02 `Linie.dc.html`) as JSON in
 * `HubSettings.offer` (ADR-H002 „Rozstrzygnięcia H1” pkt 8). Services come from `HubServices`, the
 * lines' audiences and first steps from `home.lines.scene`, the team example from `home.team` —
 * one source each, never repeated here.
 */
const head = { eyebrow: text(60), title: text(120) }

export const offerSchema = z
  .object({
    hero: z.object({
      ...head,
      lead: text(240),
      ask: text(40),
      askNote: text(80),
      searchLabel: text(40),
      examplesLabel: text(30),
      examples: z
        .array(z.object({ label: text(30), line: lineKey }))
        .min(1)
        .max(8),
    }),
    filters: z.object({
      audience: text(30),
      line: text(30),
      allAudiences: text(20),
      allLines: text(20),
      clear: text(20),
      audiences: z.object({ firma: text(20), dom: text(20) }),
    }),
    empty: z.object({ ...head, lead: text(240), help: text(40), reset: text(40) }),
    detail: z.object({
      label: text(40),
      audiences: z.object({ firma: text(30), dom: text(30), oba: text(30) }),
      who: text(20),
      includes: text(30),
      steps: text(30),
      online: text(20),
      related: text(40),
      close: text(20),
    }),
    lines: z.object({ ...head, lead: text(240), who: text(20), inCatalog: text(30) }),
    next: z.object({ ...head, items: z.array(nextItem).min(1).max(6) }),
  })
  .strict()
  .superRefine(noContactData)

export type HubOffer = z.infer<typeof offerSchema>

export function validateOffer(value: unknown): true | string {
  return firstIssue(offerSchema, value, 'Cała oferta')
}
