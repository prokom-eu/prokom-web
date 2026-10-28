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

const size = z.enum(SOLUTION_SIZES)

/**
 * When a rule applies (SW7 — the board kept these rules in its script): every list given must
 * match, any value of a list is enough. `options` = one of the answers to the need's question.
 */
const condition = obj({
  needs: z.array(key).min(1).optional(),
  options: z.array(key).min(1).optional(),
  results: z.array(key).min(1).optional(),
  kinds: z.array(label).min(1).optional(),
  sizes: z.array(size).min(1).optional(),
})

export type WizardCondition = z.infer<typeof condition>

/** Any of the conditions; an empty list never applies. */
const anyOf = z.array(condition)

/** Parts of the sample site in the live preview, switched by `preview.features`. */
export const PREVIEW_FEATURES = [
  'lang',
  'login',
  'booking',
  'form',
  'map',
  'cards',
  'catalog',
  'blog',
] as const

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
  /** Set of „Co już masz?” chips (`haves`) in step 3. */
  have: key.optional(),
  /** Address field instead of the chips (odświeżenie: the current site). */
  url: obj({ q: label, placeholder: label }).optional(),
  /** Sentence in step 3 in place of a file field (spec. §7.3). */
  fileNote: text.optional(),
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
        /** `{kontakt}` of the success steps: „zadzwonimy”. */
        verb: label,
      }),
    )
    .min(1),
  /** Order of the needs (the database does not keep the order of object keys). */
  needOrder: z.array(key).min(1),
  haves: z.record(
    key,
    obj({
      q: label,
      o: z.array(obj({ id: key, n: label, resultNote: text.optional() })).min(1),
    }),
  ),
  /** Line added to the gains of a result with sizes. */
  sizeGains: obj({ start: text, std: text, full: text }),
  /** Scope line under the price: the first rule that applies picks a `scopeNotes` key. */
  scopeRules: z.array(obj({ when: anyOf.min(1), note: key })),
  /** A bigger job: `whenNotes` uses `<when>Big` instead of `<when>Small`. */
  bigWhen: anyOf,
  /** A free result (`results[].free`): no price and term from `Solutions`. */
  free: obj({ price: label, term: label }),
  preview: obj({
    /** `previewBrands` key when neither the answer nor the need has a brand. */
    defaultBrand: key,
    features: z.array(obj({ id: z.enum(PREVIEW_FEATURES), when: anyOf })),
    /** Menu of the sample site: the first entry whose `when` applies (none = always). */
    navs: z.array(obj({ when: anyOf.optional(), items: z.array(label) })).min(1),
    /** System view before an answer (`systemViews` key). */
    systemDefault: key,
    /** App view before an answer (`appViews` key). */
    appDefault: key,
    /** Sample screen of the app, per answer of the `app` question. */
    appViews: z
      .record(key, obj({ t: label, l: z.array(z.tuple([label, label])).min(1), b: label }))
      .refine((views) => Object.keys(views).length > 0, 'Co najmniej jeden widok.'),
    /** Shown before anything is chosen. */
    rebuildDefault: z.array(key).min(1),
    automationDefault: z.array(key).min(1),
  }),
  /** Fixed texts of the component (board `Kreator`). */
  ui: obj({
    eyebrow: label,
    title: label,
    lead: text,
    needTitle: label,
    /** Names of the tile rows of step 1, by `needs[].row`. */
    rows: z.array(label).min(1).max(4),
    own: obj({ title: label, text }),
    scopeTitle: label,
    sizeQ: label,
    whenQ: label,
    describe: obj({
      title: label,
      optional: label,
      prompts: z.array(label).max(3),
      placeholder: text,
      skip: label,
    }),
    next: label,
    back: label,
    showResult: label,
    recommend: label,
    priceLabel: label,
    termLabel: label,
    /** Term of a result without sizes: the first size's term. */
    termFrom: template('{czas}'),
    /** Choice chip of „Opisz po swojemu”. */
    ownChip: label,
    checklist: obj({ title: label, hint: text }),
    yourNeeds: label,
    yourChoice: label,
    choiceEmpty: label,
    idle: obj({ title: label, text, steps: z.array(label).length(3) }),
  }),
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
    title: label,
    prefQ: label,
    button: label,
    /** Under the button: „Odpowiadamy w ciągu [CZAS ODPOWIEDZI]…”. */
    note: text,
    /** „Wysłane · {nr}”. */
    sentLabel: template('{nr}'),
    /** Under the success steps (e-mail copy, phone of the line). */
    copyNote: text,
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

  for (const [needId, need] of Object.entries(wizard.needs)) {
    if (need.have !== undefined && !(need.have in wizard.haves)) {
      issue(['needs', needId, 'have'], `Nieznany zestaw „${need.have}” (haves).`)
    }
  }
  // Conditions name only what exists; a typo would silently never apply.
  const checkConditions = (conditions: WizardCondition[], path: (string | number)[]) =>
    conditions.forEach((condition, index) => {
      for (const id of condition.needs ?? []) {
        if (!needs.has(id)) issue([...path, index, 'needs'], `Nieznana potrzeba „${id}”.`)
      }
      for (const id of condition.results ?? []) {
        if (!results.has(id)) issue([...path, index, 'results'], `Nieznany wynik „${id}”.`)
      }
    })
  wizard.scopeRules.forEach((rule, index) => {
    if (!(rule.note in wizard.scopeNotes) || rule.note === '_info') {
      issue(['scopeRules', index, 'note'], `Brak notki „${rule.note}” w scopeNotes.`)
    }
    checkConditions(rule.when, ['scopeRules', index, 'when'])
  })
  checkConditions(wizard.bigWhen, ['bigWhen'])
  wizard.preview.features.forEach((feature, index) =>
    checkConditions(feature.when, ['preview', 'features', index, 'when']),
  )
  wizard.preview.navs.forEach((nav, index) =>
    checkConditions(nav.when ?? [], ['preview', 'navs', index, 'when']),
  )
  if (!(wizard.preview.defaultBrand in wizard.previewBrands)) {
    issue(['preview', 'defaultBrand'], 'Brak w previewBrands.')
  }
  for (const [needId, need] of Object.entries(wizard.needs)) {
    if (need.row >= wizard.ui.rows.length)
      issue(['needs', needId, 'row'], 'Brak nazwy wiersza w ui.rows.')
  }
  const order = new Set(wizard.needOrder)
  if (
    order.size !== wizard.needOrder.length ||
    [...needs].some((id) => !order.has(id)) ||
    wizard.needOrder.some((id) => !needs.has(id))
  ) {
    issue(['needOrder'], 'Każda potrzeba dokładnie raz.')
  }
  if (!(wizard.preview.systemDefault in wizard.systemViews))
    issue(['preview', 'systemDefault'], 'Brak w systemViews.')
  if (!(wizard.preview.appDefault in wizard.preview.appViews))
    issue(['preview', 'appDefault'], 'Brak w preview.appViews.')
  const prefIds = wizard.contactPrefs.map((pref) => pref.id)
  prefIds.forEach((id, index) => {
    if (prefIds.indexOf(id) !== index)
      issue(['contactPrefs', index, 'id'], `„${id}” jest dwa razy.`)
  })
})

export type SoftwareWizard = z.infer<typeof softwareWizardSchema>

/** Solution slugs the wizard prices its results with (checked against `Solutions` on save). */
export function wizardSolutionSlugs(wizard: SoftwareWizard): string[] {
  return [...new Set(Object.values(wizard.resultToSolutionSlug).filter((s) => s !== null))]
}

export function validateSoftwareWizard(value: unknown): true | string {
  return firstIssue(softwareWizardSchema, value, 'Reguły kreatora')
}
