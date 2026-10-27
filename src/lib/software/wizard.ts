import { z } from 'zod'

import { SOLUTION_SIZES } from './options'
import { firstIssue, key, label, obj, slug, svgPath, text } from './schema'

/**
 * Rules and texts of the Software wizard (`/dobierz`, spec. §6.3), one JSON value in
 * `SoftwareSettings.wizard` (ADR-014 §1.3, rozstrz. v20 1, 7). The shape is
 * `seed/prokomsoftware/kreator.json` 1:1 — its short keys (`n` name, `d` description, `ic` icon,
 * `pv` preview, `q` question, `h` hint, `o` options, `g` gains, `nd` what we need) stay as they are.
 * Prices are never here: they come from `Solutions.prices` (`resultToSolutionSlug`).
 */

const option = obj({ id: key, n: label, ic: svgPath })

const need = obj({
  n: label,
  d: text,
  ic: svgPath,
  /** Row of the tile grid in step 1. */
  row: z.number().int().min(0).max(3),
  /** Live preview shown for this need. */
  pv: key,
  q: label,
  h: text,
  o: z.array(option).min(1),
  multi: z.boolean().optional(),
  /** No size step (wizytówka, landing page). */
  noSize: z.boolean().optional(),
})

const result = obj({
  n: label,
  kind: label,
  pv: key,
  g: z.array(label).min(1),
  nd: z.array(label),
  /** Free of charge („Rozmowa i propozycja na piśmie”). */
  free: z.boolean().optional(),
  /** Monthly price (care) — shown with `priceDisplay.monthTemplate`. */
  month: z.boolean().optional(),
})

/** Result id, or one per option of the need's question (`*` = any other option). */
const mappingTarget = z.union([key, z.record(z.union([key, z.literal('*')]), key)])

const template = (token: string) =>
  label.refine((value) => value.includes(token), { message: `Musi zawierać ${token}.` })

/** Keyed texts with the package's `_info` note (scope notes). */
const notes = z.object({ _info: z.string().optional() }).catchall(text)

/**
 * How prices read on the site (kreator.json → `priceDisplay`): a chosen size, „od” the lowest,
 * the monthly care price, no price and no term. Also used by the catalog cards (SW9).
 */
export const priceDisplaySchema = obj({
  template: template('{cena}'),
  templateFrom: template('{cena}'),
  fallback: label,
  termFallback: label,
  monthTemplate: template('{cena}'),
})

export type PriceDisplay = z.infer<typeof priceDisplaySchema>

export const softwareWizardSchema = obj({
  steps: z.array(label).length(5),
  needs: z.record(key, need),
  results: z.record(key, result),
  sizes: z
    .array(obj({ id: z.enum(SOLUTION_SIZES), n: label, d: label }))
    .length(SOLUTION_SIZES.length),
  whens: z.array(obj({ id: key, n: label })).min(1),
  phrases: z.array(label),
  contactPrefs: z
    .array(
      obj({
        id: key,
        n: label,
        /** Value of `Inquiries.preferredContact` (ADR-014 §3.1). */
        inquiryValue: z.enum(['phone', 'email', 'meeting', 'online']),
      }),
    )
    .min(1),
  needsChecklist: z.record(key, z.array(label)),
  /** [name, slogan, lead, button, domain, menu] of the sample site in the preview. */
  previewBrands: z.record(key, z.tuple([label, label, label, label, label, z.array(label)])),
  /** [problem, after the rebuild]. */
  rebuildIssues: z.record(key, z.tuple([label, label])),
  systemViews: z.record(
    key,
    obj({
      side: z.array(label).min(1),
      /** Active item of `side`. */
      a: z.number().int().min(0),
      t: label,
      v: key,
      l: z.array(z.array(label)).optional(),
    }),
  ),
  automationActions: z.record(key, label),
  mapping: z.record(key, mappingTarget),
  resultToSolutionSlug: z.record(key, slug.nullable()),
  icons: z.record(key, svgPath),
  whenNotes: obj({
    asap: text,
    zimaBig: text,
    zimaSmall: text,
    lato: text,
    brak: text,
    default: text,
    _rule: z.string().optional(),
  }),
  priceDisplay: priceDisplaySchema,
  scopeNotes: notes,
  mobile: obj({ previewToggle: z.tuple([label, label]) }),
  badges: z.array(label).max(5),
  send: obj({
    fields: z.array(label).min(1),
    consent: text,
    errors: obj({ contact: text, consent: text }),
    success: obj({ title: label, steps: z.array(text).min(1) }),
  }),
}).superRefine((wizard, ctx) => {
  const results = new Set(Object.keys(wizard.results))
  const needs = new Set(Object.keys(wizard.needs))
  const issue = (path: (string | number)[], message: string) =>
    ctx.addIssue({ code: 'custom', path, message })

  for (const [needId, target] of Object.entries(wizard.mapping)) {
    if (needId !== 'own' && !needs.has(needId)) issue(['mapping', needId], 'Nieznana potrzeba.')
    const targets = typeof target === 'string' ? { '': target } : target
    for (const [optionId, resultId] of Object.entries(targets)) {
      if (!results.has(resultId)) {
        issue(['mapping', needId, ...(optionId ? [optionId] : [])], `Nieznany wynik „${resultId}”.`)
      }
    }
  }
  for (const resultId of results) {
    if (!(resultId in wizard.resultToSolutionSlug)) {
      issue(['resultToSolutionSlug', resultId], 'Wynik bez rozwiązania (null = bez ceny).')
    }
  }
  for (const resultId of Object.keys(wizard.resultToSolutionSlug)) {
    if (!results.has(resultId)) issue(['resultToSolutionSlug', resultId], 'Nieznany wynik.')
  }
  const sizeIds = wizard.sizes.map((size) => size.id)
  sizeIds.forEach((id, index) => {
    if (sizeIds.indexOf(id) !== index)
      issue(['sizes', index, 'id'], `Rozmiar „${id}” jest dwa razy.`)
  })
  for (const [viewId, view] of Object.entries(wizard.systemViews)) {
    if (view.a >= view.side.length) issue(['systemViews', viewId, 'a'], 'Poza listą `side`.')
  }
})

export type SoftwareWizard = z.infer<typeof softwareWizardSchema>

/** Solution slugs the wizard prices its results with (checked against `Solutions` on save). */
export function wizardSolutionSlugs(wizard: SoftwareWizard): string[] {
  return [...new Set(Object.values(wizard.resultToSolutionSlug).filter((s) => s !== null))]
}

export function validateSoftwareWizard(value: unknown): true | string {
  return firstIssue(softwareWizardSchema, value, 'Reguły kreatora')
}
