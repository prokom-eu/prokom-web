import { z } from 'zod'

import { firstIssue, key, label, obj, slug, svgPath, text } from './schema'

/**
 * Rules and texts of the Software wizard (`/dobierz`, spec. §6.3), one JSON value in
 * `SoftwareSettings.wizard` (ADR-014 §1.3, v22 pkt 10). The shape is
 * `seed/prokomsoftware/kreator.json` 1:1 — its short keys (`n` name, `d` description, `ic` icon,
 * `pv` preview, `q` question, `h` hint, `o` options, `g` gains, `nd` what we need) stay as they are.
 * Prices and terms are never here: they come from `Solutions` (`resultToSolutionSlug`,
 * `addOns.items[].slug`, `{cena:<slug>}` / `{termin:<slug>}` in texts). One „od” price, no sizes.
 */

const option = obj({ id: key, n: label, ic: svgPath })

/**
 * When a rule applies (the board kept these rules in its script): every key given must match,
 * any value of a list is enough; `{}` always applies. `options` = one of the answers to the need's
 * question, `haves` = the „Co już masz?” chip, `whens` = the term chip, `minOptions` = at least
 * that many answers, `outsidePrice` = an answer outside `scope.<result>.featuresInPrice`.
 */
const condition = obj({
  needs: z.array(key).min(1).optional(),
  options: z.array(key).min(1).optional(),
  results: z.array(key).min(1).optional(),
  kinds: z.array(label).min(1).optional(),
  haves: z.array(key).min(1).optional(),
  whens: z.array(key).min(1).optional(),
  minOptions: z.number().int().min(1).max(20).optional(),
  outsidePrice: z.literal(true).optional(),
})

export type WizardCondition = z.infer<typeof condition>

/** Any of the conditions; an empty list never applies. */
const anyOf = z.array(condition)

/** A sentence shown when its conditions apply — the first matching rule of a list wins. */
const sentenceRule = obj({ when: anyOf.min(1), text })

/** What the contact field asks for: a phone, an e-mail or either (meeting, online). */
export const CONTACT_FIELDS = ['phone', 'email', 'any'] as const

export type ContactField = (typeof CONTACT_FIELDS)[number]

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
  /** Set of „Co już masz?” chips (`haves`) in step 3. */
  have: key.optional(),
  /** Address field instead of the chips (przebudowa: the current site). */
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
  /** Free of charge („Rozmowa i propozycja zakresu”). */
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
 * How prices read on the site (kreator.json → `priceDisplay`): always „od” (v22). Also used by the
 * catalog cards (SW9) and the offer window (SWR3).
 */
export const priceDisplaySchema = obj({
  /** „od {cena} zł netto” — the result and the cards. */
  template: template('{cena}'),
  /** „od {cena} zł” — tiles of step 1 and add-ons. */
  short: template('{cena}'),
  /** Care from its lowest level: „od {cena} zł / mies.”. */
  monthTemplate: template('{cena}'),
  /** The price of one care level: „{cena} zł / mies.”. */
  levelMonthTemplate: template('{cena}'),
  fallback: label,
  termFallback: label,
  priceSub: label,
  /** Under „Potrzebujesz czegoś więcej?” — before and after something is ticked. */
  moreHint: text,
  moreSelectedNote: text,
  /** A result without a price (apps, automations). */
  noPrice: obj({ price: label, term: label, priceSub: label, termSub: text, mobileBar: label }),
  scopeIntro: label,
})

export type PriceDisplay = z.infer<typeof priceDisplaySchema>

/** Step „Zakres”: what the „od” price includes and examples of more (quoted in writing). */
const scopeEntry = obj({
  included: z.array(label).min(1).max(6),
  moreExamples: z.array(obj({ id: key, n: label })).max(6),
  /** Answers of the need's question within the price (rozbudowana: blog); others are extra. */
  featuresInPrice: z.array(key).optional(),
})

const shopSwitch = obj({ title: label, sub: label })

export const softwareWizardSchema = obj({
  steps: z.array(label).length(4),
  /** Steps of „Opisz po swojemu”. */
  stepsOwn: z.array(label).length(3),
  needs: z.record(key, need),
  results: z.record(key, result),
  whens: z.array(obj({ id: key, n: label })).min(1),
  /** Quick words for „Kilka słów od siebie” when the need has none in `needPhrases`. */
  phrases: z.array(label),
  /** Quick words per need (board script `PHM`). */
  needPhrases: z.record(key, z.array(label).max(6)),
  contactPrefs: z
    .array(
      obj({
        id: key,
        n: label,
        ic: svgPath,
        /** Value of `Inquiries.preferredContact` (ADR-014 §3.1). */
        inquiryValue: z.enum(['phone', 'email', 'meeting', 'online']),
        /** `{kontakt}` of the success: „zadzwonimy”. */
        verb: label,
        /** Which contact the field asks for (`send.contact`). */
        field: z.enum(CONTACT_FIELDS),
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
  scope: z.object({ _info: z.string().optional() }).catchall(scopeEntry),
  /** „Dlaczego to rozwiązanie” — `{lista}` = the chosen answers. */
  recommend: z.array(sentenceRule),
  /** Honest note when less may be enough. */
  honest: z.array(sentenceRule),
  addOns: obj({
    items: z
      .array(
        obj({
          id: key,
          n: label,
          d: text,
          /** Key of `icons`. */
          icon: key,
          /** The solution that prices the add-on (and becomes an item of the inquiry). */
          slug,
          /** Name of a level of that solution (`Solutions.levels`) — its price instead. */
          level: label.optional(),
        }),
      )
      .min(1),
    /** The first rule that applies lists the add-ons of a result (`[]` = none). */
    rules: z.array(obj({ when: anyOf.min(1), items: z.array(key).max(4) })).min(1),
  }),
  /**
   * „Chcesz sprzedawać online?” — switches the result to `toShop.result`; `back` returns to the
   * result of `mapping` (its texts only).
   */
  shopHint: obj({
    when: anyOf.min(1),
    toShop: shopSwitch.extend({ result: key }),
    back: shopSwitch,
  }),
  /** Scope line under the price: the first rule that applies picks a `scopeNotes` key. */
  scopeRules: z.array(obj({ when: anyOf.min(1), note: key })),
  /** A bigger job: `whenNotes` uses `<when>Big` instead of `<when>Small`. */
  bigWhen: anyOf,
  /**
   * `{data}` of the term notes, as words („30 listopada”): one rule instead of a fact to edit
   * (decyzja SWD2 nr 11). The sentence has no year, so the words are the same every year.
   */
  winterDeadline: obj({
    day: z.number().int().min(1).max(31),
    month: z.number().int().min(1).max(12),
  }).refine(({ day, month }) => day <= new Date(Date.UTC(2024, month, 0)).getUTCDate(), {
    message: 'Nie ma takiego dnia.',
  }),
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
    needLead: label,
    /** Names of the tile rows of step 1, by `needs[].row`. */
    rows: z.array(label).min(1).max(4),
    own: obj({ title: label, text }),
    scopeTitle: label,
    whenQ: label,
    /** Step „Twój opis” of „Opisz po swojemu”. */
    describe: obj({
      title: label,
      optional: label,
      prompts: z.array(label).max(3),
      placeholder: text,
    }),
    /** „Kilka słów od siebie” in step „Zakres” (opened by a button). */
    words: obj({ open: label, optional: label, title: label, placeholder: text }),
    /** „Krok {n} z {z}” on the phone. */
    stepOf: template('{n}'),
    next: label,
    back: label,
    showResult: label,
    /** Button of the phone bar on the result: jumps to the quote block. */
    sendJump: label,
    restart: label,
    /** Badge of the result: „Twoje rozwiązanie”. */
    recommend: label,
    included: label,
    priceLabel: label,
    termLabel: label,
    /** Under the term: priced („od podpisania umowy”) or free („od wysłania opisu”). */
    termSub: obj({ priced: label, free: label }),
    moreTitle: label,
    /** Tag of each „więcej” position: „do wyceny”. */
    moreTag: label,
    toQuoteTitle: label,
    /** Choice chip of „Opisz po swojemu”. */
    ownChip: label,
    /** „Masz {n} z {z}”. */
    checklist: obj({ title: label, hint: text, count: template('{n}') }),
    addOns: obj({ title: label, add: label, added: label }),
    /** „Twoje słowa” — the description in the result and the inquiry. */
    yourNeeds: label,
    yourChoice: label,
    choiceEmpty: label,
    /** The live quote: column on the desktop, bar on the phone. */
    live: obj({
      title: label,
      previewTitle: label,
      label,
      empty: label,
      emptyText: text,
    }),
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
  }),
  priceDisplay: priceDisplaySchema,
  scopeNotes: notes,
  mobile: obj({ previewToggle: z.tuple([label, label]) }),
  badges: z.array(label).max(5),
  /** The quote block of the result (ZMIANY-v21 §10.3): „Ostatni krok · Dokąd wysłać wycenę?”. */
  send: obj({
    eyebrow: label,
    title: label,
    lead: text,
    /** The ticket „Twoja wycena · szkic”, after sending „przyjęta”. */
    ticket: obj({ title: label, draft: label, accepted: label }),
    prefQ: label,
    name: obj({ label, placeholder: label }),
    /** The contact field by `contactPrefs[].field`: label, placeholder, error. */
    contact: z.record(z.enum(CONTACT_FIELDS), obj({ label, placeholder: label, error: text })),
    errors: obj({ consent: text }),
    button: obj({ title: label, sub: label }),
    /** Icons (keys of `icons`) and texts under the button. */
    trust: z.array(obj({ icon: key, text: label })).max(4),
    /** „Wysłane · {nr}”. */
    sentLabel: template('{nr}'),
    success: obj({
      /** „Dziękujemy, {imie}. …” — `titleNoName` when the name is empty. */
      title: template('{imie}'),
      titleNoName: label,
      /** `{kontakt}` = the verb of the chosen preference. */
      lead: text,
      timeline: z.array(obj({ when: label, what: label })).length(3),
      /** Under the timeline; the phone of the line follows it. */
      note: text,
    }),
  }),
}).superRefine((wizard, ctx) => {
  const results = new Set(Object.keys(wizard.results))
  const needs = new Set(Object.keys(wizard.needs))
  const haves = new Set(Object.values(wizard.haves).flatMap((set) => set.o.map((o) => o.id)))
  const whens = new Set(wizard.whens.map((when) => when.id))
  const issue = (path: (string | number)[], message: string) =>
    ctx.addIssue({ code: 'custom', path, message })
  const duplicates = (ids: string[], path: (string | number)[]) =>
    ids.forEach((id, index) => {
      if (ids.indexOf(id) !== index) issue([...path, index, 'id'], `„${id}” jest dwa razy.`)
    })

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
  for (const resultId of Object.keys(wizard.scope)) {
    if (resultId !== '_info' && !results.has(resultId))
      issue(['scope', resultId], 'Nieznany wynik.')
  }
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
      const check = (list: string[] | undefined, known: Set<string>, field: string) => {
        for (const id of list ?? []) {
          if (!known.has(id)) issue([...path, index, field], `Nieznane „${id}”.`)
        }
      }
      check(condition.needs, needs, 'needs')
      check(condition.results, results, 'results')
      check(condition.haves, haves, 'haves')
      check(condition.whens, whens, 'whens')
    })
  wizard.scopeRules.forEach((rule, index) => {
    if (!(rule.note in wizard.scopeNotes) || rule.note === '_info') {
      issue(['scopeRules', index, 'note'], `Brak notki „${rule.note}” w scopeNotes.`)
    }
    checkConditions(rule.when, ['scopeRules', index, 'when'])
  })
  checkConditions(wizard.bigWhen, ['bigWhen'])
  wizard.recommend.forEach((rule, index) =>
    checkConditions(rule.when, ['recommend', index, 'when']),
  )
  wizard.honest.forEach((rule, index) => checkConditions(rule.when, ['honest', index, 'when']))
  checkConditions(wizard.shopHint.when, ['shopHint', 'when'])
  if (!results.has(wizard.shopHint.toShop.result)) {
    issue(['shopHint', 'toShop', 'result'], 'Nieznany wynik.')
  }

  const addOnIds = wizard.addOns.items.map((item) => item.id)
  duplicates(addOnIds, ['addOns', 'items'])
  wizard.addOns.items.forEach((item, index) => {
    if (!(item.icon in wizard.icons)) issue(['addOns', 'items', index, 'icon'], 'Brak w icons.')
  })
  wizard.addOns.rules.forEach((rule, index) => {
    checkConditions(rule.when, ['addOns', 'rules', index, 'when'])
    for (const id of rule.items) {
      if (!addOnIds.includes(id)) issue(['addOns', 'rules', index, 'items'], `Nieznane „${id}”.`)
    }
  })

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
  duplicates(
    wizard.contactPrefs.map((pref) => pref.id),
    ['contactPrefs'],
  )
  wizard.send.trust.forEach((item, index) => {
    if (!(item.icon in wizard.icons)) issue(['send', 'trust', index, 'icon'], 'Brak w icons.')
  })
  for (const needId of Object.keys(wizard.needPhrases)) {
    if (!needs.has(needId)) issue(['needPhrases', needId], 'Nieznana potrzeba.')
  }
})

export type SoftwareWizard = z.infer<typeof softwareWizardSchema>

/** Solution slugs the wizard prices with — results and add-ons (checked on save). */
export function wizardSolutionSlugs(wizard: SoftwareWizard): string[] {
  const results = Object.values(wizard.resultToSolutionSlug).filter((s) => s !== null)
  return [...new Set([...results, ...wizard.addOns.items.map((item) => item.slug)])]
}

export function validateSoftwareWizard(value: unknown): true | string {
  return firstIssue(softwareWizardSchema, value, 'Reguły kreatora')
}
