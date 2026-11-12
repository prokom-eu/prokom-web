import { z } from 'zod'

import { DASH_VARIANTS, isVariantOf, MOCKUP_KINDS, SITE_VARIANTS } from '../mockups'
import { WIZARD_FIRMS } from '../options'
import { priceDisplaySchema, template } from '../priceDisplay'
import { firstIssue, key, label, obj, slug, svgPath, text } from '../schema'
import { WIZARD_GROUPS, WIZARD_PICKS, WIZARD_STEPS, type WizardPick } from './steps'

/**
 * Wizard v3 „Aurora” (`/dobierz` and `#dobierz`, ZMIANY-v24 §7, ADR-014 v24 pkt 3): one JSON value
 * in `SoftwareSettings.wizard`. The questions depend on the group of the chosen kind; there are no
 * add-ons. Every rule the board kept in its script (`v24/wzorzec/aurora.js`: tips, preview) is
 * data here, not code. Prices and terms are never here: they come from `Solutions` (`solution`).
 */

export {
  DESCRIPTION_STEP,
  PICK_STEPS,
  SIZE_STEP,
  URL_STEP,
  WIZARD_GROUPS,
  WIZARD_PICKS,
  WIZARD_STEPS,
  type WizardGroup,
  type WizardPick,
  type WizardStep,
} from './steps'

const option = obj({ id: key, label })
const options = z.array(option).min(1).max(12)

const WIZARD_FIRM_VALUES = WIZARD_FIRMS.map((firm) => firm.value) as [
  (typeof WIZARD_FIRMS)[number]['value'],
  ...(typeof WIZARD_FIRMS)[number]['value'][],
]

/**
 * When a rule applies: every key given must match. `has` — at least one of the ids is picked (for
 * every pick listed); `lacks` — none of them is; `picked` — something is picked in each of these;
 * `anyIndustry` — an industry is chosen. `{}` (or no `when`) always applies.
 */
const condition = obj({
  groups: z.array(z.enum(WIZARD_GROUPS)).min(1).optional(),
  types: z.array(key).min(1).optional(),
  industries: z.array(z.enum(WIZARD_FIRM_VALUES)).min(1).optional(),
  anyIndustry: z.literal(true).optional(),
  has: z.partialRecord(z.enum(WIZARD_PICKS), z.array(key).min(1)).optional(),
  lacks: z.partialRecord(z.enum(WIZARD_PICKS), z.array(key).min(1)).optional(),
  picked: z.array(z.enum(WIZARD_PICKS)).min(1).optional(),
  sizes: z.array(key).min(1).optional(),
})
export type WizardCondition = z.infer<typeof condition>

/** Price block of a kind without a solution price (Nie wiem jeszcze: „0 zł”, a 30-minute talk). */
const noPrice = obj({ tile: label, price: label, sub: label, term: label })

const stepText = obj({ label, title: label, lead: text.optional() })

export const softwareWizardSchema = obj({
  /** Tiles of step 1 („Czego potrzebujesz?”), in order. */
  types: z
    .array(
      obj({
        id: key,
        group: z.enum(WIZARD_GROUPS),
        /** Name, price, term and the 3 points of the result come from this solution. */
        solution: slug.nullable(),
        label,
        desc: label,
        /** Required without a solution. */
        noPrice: noPrice.optional(),
      }),
    )
    .min(1)
    .max(10),
  /** The kind the live card shows before step 1 is answered (not ticked). Optional: the first. */
  defaultType: key.optional(),
  /** Steps of each group: always `type`, `ind`, …, `res`. */
  groups: z.record(z.enum(WIZARD_GROUPS), z.array(z.enum(WIZARD_STEPS)).min(3).max(6)),
  steps: z.record(z.enum(WIZARD_STEPS), stepText),
  options: obj({
    have: options,
    /** „Co ma umieć” per site kind (`types[].id`); the industry adds 2 of its features. */
    featByType: z.record(key, options),
    redo: options,
    fix: options,
    today: options,
    sysf: options,
    sizes: options,
    auto: options,
    prog: options,
    desc: options,
  }),
  /** An option that excludes the others of its pick („Zaczynamy od zera”). */
  exclusive: z.partialRecord(z.enum(WIZARD_PICKS), key),
  /** Step 2 — the industries of the showroom (`?firma=` keys). */
  industries: z
    .array(
      obj({
        key: z.enum(WIZARD_FIRM_VALUES),
        name: label,
        icon: svgPath,
        site: z.enum(SITE_VARIANTS),
        system: z.enum(DASH_VARIANTS),
        /** Up to 2 join „Co ma umieć” (none for „Inna firma”). */
        features: z.array(option).max(4),
      }),
    )
    .min(1)
    .max(12),
  /** Tip of the live preview and the result: the first matching rule wins; the last has no `when`. */
  tips: z
    .array(obj({ when: condition.optional(), text }))
    .min(1)
    .refine((tips) => !tips.at(-1)?.when, { message: 'Ostatnia podpowiedź bez warunku.' }),
  /**
   * Mock-up of the live preview: the first matching rule wins. `fromIndustry` takes the chosen
   * industry's site or system variant instead of `variant`.
   */
  preview: z
    .array(
      obj({
        when: condition.optional(),
        kind: z.enum(MOCKUP_KINDS),
        variant: key,
        fromIndustry: z.enum(['site', 'system']).optional(),
      }),
    )
    .min(1)
    .refine((rules) => !rules.at(-1)?.when, { message: 'Ostatnia reguła bez warunku.' }),
  /** „W cenie każdej strony” — SEO and the rest are in the price, not an option. */
  inPrice: obj({ title: label, items: z.array(label).min(1).max(6) }),
  /** Labels of the summary chips and of the answers in the inquiry. */
  summary: obj({
    type: label,
    industry: label,
    have: label,
    feat: label,
    redo: label,
    fix: label,
    today: label,
    sysf: label,
    size: label,
    auto: label,
    prog: label,
    desc: label,
    url: label,
  }),
  ui: obj({
    eyebrow: label,
    title: label,
    /** Not shown since 08.11 („Policz swój projekt.” alone, Krystian); kept so saved settings read. */
    em: label.optional(),
    lead: text,
    back: label,
    skip: label,
    next: label,
    showResult: label,
    restart: label,
    /** Name of the step bar for screen readers („Kroki kreatora”). */
    stepsLabel: label,
    live: label,
    stepOf: template('{n}').refine((value) => value.includes('{m}'), {
      message: 'Musi zawierać {m}.',
    }),
    tipLabel: label,
    fullOffer: label,
    sizeQ: label,
    progQ: label,
    descPick: label,
    descPlaceholder: label,
    urlLabel: label,
    urlPlaceholder: label,
  }),
  /** `/dobierz`: the hero and „Cztery kroki do startu” (ZMIANY-v24 §9.5). */
  page: obj({
    /** Eyebrows of the hero and of the steps (optional: the wizard's own eyebrow stands in). */
    eyebrow: label.optional(),
    title: label,
    em: label,
    lead: text,
    stepsEyebrow: label.optional(),
    stepsTitle: label,
    steps: z.array(obj({ title: label, text })).length(4),
  }),
  send: obj({
    noteLabel: label,
    notePlaceholder: label,
    name: obj({ label, placeholder: label }),
    contact: obj({ label, placeholder: label, error: label }),
    errors: obj({ consent: label }),
    button: label,
    /** First line of the inquiry message: `{rodzaj}` = the kind's label. */
    messageTemplate: template('{rodzaj}'),
  }),
  /** How prices read — also used by the catalog cards and the offer window. */
  priceDisplay: priceDisplaySchema,
}).superRefine((wizard, ctx) => {
  const issue = (path: (string | number)[], message: string) =>
    ctx.addIssue({ code: 'custom', path, message })

  const typeIds = new Set(wizard.types.map((type) => type.id))
  const industryKeys = new Set(wizard.industries.map((industry) => industry.key))
  if (typeIds.size !== wizard.types.length) issue(['types'], 'Powtórzone id rodzaju.')
  if (industryKeys.size !== wizard.industries.length) {
    issue(['industries'], 'Powtórzona branża.')
  }

  if (wizard.defaultType && !typeIds.has(wizard.defaultType)) {
    issue(['defaultType'], 'Nieznany rodzaj.')
  }
  wizard.types.forEach((type, i) => {
    if (!type.solution && !type.noPrice) issue(['types', i, 'noPrice'], 'Wymagane bez rozwiązania.')
  })

  for (const group of WIZARD_GROUPS) {
    const steps = wizard.groups[group]
    if (steps[0] !== 'type' || steps[1] !== 'ind' || steps.at(-1) !== 'res') {
      issue(['groups', group], 'Kroki: type, ind, …, res.')
    }
    if (new Set(steps).size !== steps.length) issue(['groups', group], 'Powtórzony krok.')
  }

  // „Co ma umieć” for every site kind, and only for them.
  for (const type of wizard.types) {
    const asksFeat = wizard.groups[type.group].includes('feat')
    if (asksFeat && !wizard.options.featByType[type.id]) {
      issue(['options', 'featByType', type.id], 'Brak możliwości rodzaju.')
    }
  }
  for (const id of Object.keys(wizard.options.featByType)) {
    if (!typeIds.has(id)) issue(['options', 'featByType', id], 'Nieznany rodzaj.')
  }

  const pickIds = (pick: WizardPick): Set<string> => {
    if (pick === 'feat') {
      return new Set([
        ...Object.values(wizard.options.featByType).flatMap((list) => list.map((o) => o.id)),
        ...wizard.industries.flatMap((industry) => industry.features.map((o) => o.id)),
      ])
    }
    return new Set(wizard.options[pick].map((o) => o.id))
  }
  const sizeIds = new Set(wizard.options.sizes.map((o) => o.id))

  for (const [pick, id] of Object.entries(wizard.exclusive)) {
    if (id && !pickIds(pick as WizardPick).has(id)) issue(['exclusive', pick], 'Nieznana opcja.')
  }

  const checkWhen = (when: WizardCondition | undefined, path: (string | number)[]) => {
    if (!when) return
    when.types?.forEach((id) => {
      if (!typeIds.has(id)) issue([...path, 'types'], `Nieznany rodzaj: ${id}.`)
    })
    when.sizes?.forEach((id) => {
      if (!sizeIds.has(id)) issue([...path, 'sizes'], `Nieznana wielkość: ${id}.`)
    })
    for (const part of ['has', 'lacks'] as const) {
      for (const [pick, ids] of Object.entries(when[part] ?? {})) {
        const known = pickIds(pick as WizardPick)
        ids?.forEach((id) => {
          if (!known.has(id)) issue([...path, part, pick], `Nieznana opcja: ${id}.`)
        })
      }
    }
  }
  wizard.tips.forEach((tip, i) => checkWhen(tip.when, ['tips', i, 'when']))
  wizard.preview.forEach((rule, i) => {
    checkWhen(rule.when, ['preview', i, 'when'])
    if (!isVariantOf(rule.kind, rule.variant)) {
      issue(['preview', i, 'variant'], 'Wariant nie pasuje do makiety.')
    }
    // The industry gives a site variant to a site mock-up and a system one to a panel.
    const fits = { site: 'site', system: 'dash' } as const
    if (rule.fromIndustry && fits[rule.fromIndustry] !== rule.kind) {
      issue(['preview', i, 'fromIndustry'], 'Wariant branży nie pasuje do makiety.')
    }
  })
})

export type SoftwareWizard = z.infer<typeof softwareWizardSchema>
export type WizardType = SoftwareWizard['types'][number]
export type WizardIndustry = SoftwareWizard['industries'][number]

/** Solution slugs the wizard prices with (checked on save). */
export function wizardSolutionSlugs(wizard: SoftwareWizard): string[] {
  return [...new Set(wizard.types.flatMap((type) => (type.solution ? [type.solution] : [])))]
}

export function validateSoftwareWizard(value: unknown): true | string {
  return firstIssue(softwareWizardSchema, value, 'Reguły kreatora')
}
