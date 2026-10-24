import { z } from 'zod'

import { WIZARD_BUSINESS_TYPES } from './options'

/**
 * Rules of the offer wizard (`/kreator`, spec. §6.8), kept as one JSON value in
 * `BiznesSettings.wizard` (B1b decision: nested rules, rarely edited — a JSON field checked by
 * this schema instead of panel forms). B10c: every condition of the board is data here —
 * proposals are product slugs, badges and included services say which needs they follow.
 */

const BUSINESS_TYPE_IDS = WIZARD_BUSINESS_TYPES.map((type) => type.value) as [
  (typeof WIZARD_BUSINESS_TYPES)[number]['value'],
  ...(typeof WIZARD_BUSINESS_TYPES)[number]['value'][],
]

export type BusinessTypeId = (typeof BUSINESS_TYPE_IDS)[number]

/** Line icons of the wizard tiles (board `Kreator`), drawn by `WizardIcon`. */
export const WIZARD_ICONS = [
  'cart',
  'fork',
  'bed',
  'calc',
  'car',
  'cross',
  'cap',
  'factory',
  'truck',
  'plus',
  'register',
  'pos',
  'terminal',
  'program',
  'booking',
  'ksef',
  'laptop',
  'wifi',
  'backup',
  'shield',
  'screen',
  'care',
  'signature',
] as const

export type WizardIconName = (typeof WIZARD_ICONS)[number]

/** Colours of the business type tiles: the tone tokens of the Biznes line (`tokens.css`). */
export const WIZARD_TONES = ['green', 'red', 'blue', 'violet'] as const

const businessTypeId = z.enum(BUSINESS_TYPE_IDS)
const id = z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
const label = z.string().trim().min(1).max(120)
const caption = z.string().trim().max(200).optional()
const icon = z.enum(WIZARD_ICONS)

export const wizardSchema = z
  .object({
    steps: z.array(label).min(1),
    businessTypes: z
      .array(
        z.object({ id: businessTypeId, name: label, caption, icon, tone: z.enum(WIZARD_TONES) }),
      )
      .min(1),
    needs: z.array(z.object({ id, name: label, caption, icon })).min(1),
    /** Needs ticked at the start for a business type. */
    defaultNeeds: z.partialRecord(businessTypeId, z.array(id)),
    /** Answers of the „Skala” step; `default` is chosen at the start. */
    scale: z.object({
      salesPoints: z.object({ options: z.array(label).min(1), default: label }),
      computers: z.object({ options: z.array(label).min(1), default: label }),
      premises: z.object({
        options: z.array(z.object({ id, name: label, caption })).min(1),
        default: id,
      }),
      when: z.array(z.object({ name: label, caption })),
    }),
    /** Product slug per need and business type (`*` = any other type). */
    proposals: z.record(id, z.partialRecord(z.union([businessTypeId, z.literal('*')]), id)),
    /** Needs counted per sales point („2 × kasa”). */
    multiplyBySalesPoints: z.array(id),
    includedServices: z.object({
      always: z.array(label),
      /** Added when any of `needs` is chosen (and the business type matches, when set). */
      rules: z.array(
        z.object({
          needs: z.array(id).min(1),
          text: label,
          businessTypes: z.array(businessTypeId).optional(),
          exceptBusinessTypes: z.array(businessTypeId).optional(),
        }),
      ),
    }),
    /**
     * Shown when all `needs` are chosen (and the premises match, when set). A legal fact only
     * with its source in the caption (plan B §4).
     */
    badges: z.array(
      z.object({
        needs: z.array(id).min(1),
        premises: id.optional(),
        value: z.string().trim().min(1).max(8),
        text: label,
        caption,
      }),
    ),
  })
  .superRefine((wizard, ctx) => {
    const needs = new Set(wizard.needs.map((need) => need.id))
    const check = (needId: string, path: (string | number)[]) => {
      if (!needs.has(needId)) {
        ctx.addIssue({ code: 'custom', path, message: `Nieznana potrzeba „${needId}”.` })
      }
    }
    for (const [type, list] of Object.entries(wizard.defaultNeeds)) {
      list?.forEach((needId, index) => check(needId, ['defaultNeeds', type, index]))
    }
    for (const needId of Object.keys(wizard.proposals)) check(needId, ['proposals', needId])
    wizard.multiplyBySalesPoints.forEach((needId, index) =>
      check(needId, ['multiplyBySalesPoints', index]),
    )
    wizard.includedServices.rules.forEach((rule, index) =>
      rule.needs.forEach((needId, n) => check(needId, ['includedServices', 'rules', index, n])),
    )
    wizard.badges.forEach((badge, index) =>
      badge.needs.forEach((needId, n) => check(needId, ['badges', index, 'needs', n])),
    )
    const { salesPoints, computers, premises } = wizard.scale
    const notIn = (value: string, options: string[], path: string[]) => {
      if (!options.includes(value)) {
        ctx.addIssue({ code: 'custom', path, message: `„${value}” nie ma na liście.` })
      }
    }
    notIn(salesPoints.default, salesPoints.options, ['scale', 'salesPoints', 'default'])
    notIn(computers.default, computers.options, ['scale', 'computers', 'default'])
    const premisesIds = premises.options.map((option) => option.id)
    notIn(premises.default, premisesIds, ['scale', 'premises', 'default'])
    wizard.badges.forEach((badge, index) => {
      if (badge.premises) notIn(badge.premises, premisesIds, ['badges', String(index), 'premises'])
    })
  })

export type Wizard = z.infer<typeof wizardSchema>

/** `validate` of the JSON field: `true` or the first problem, readable in the panel. */
export function validateWizard(value: unknown): true | string {
  if (value === null || value === undefined) return true
  const result = wizardSchema.safeParse(value)
  if (result.success) return true
  const [issue] = result.error.issues
  return `Reguły kreatora: ${issue?.path.join('.') || '(całość)'} — ${issue?.message ?? 'błąd'}`
}

/** Shape of `seed/prokombiznes/kreator.json` (Polish keys of the design package). */
type SeedWizard = {
  kroki: string[]
  rodzaje_firm: { id: string; nazwa: string; podpis?: string }[]
  potrzeby: { id: string; nazwa: string; podpis?: string }[]
  domyslne_potrzeby: Record<string, string[]>
  skala: {
    stanowiska_sprzedazy: string[]
    komputery: string[]
    lokal: Record<string, string>
    kiedy: string[]
  }
  propozycja_dla_potrzeby: Record<string, Record<string, string>>
  uslugi_w_cenie: Record<string, string | string[]>
}

/**
 * What the package leaves to the board `Kreator` (its script): icons and tones of the tiles,
 * captions of the choices, defaults, the badges and the services that depend on the type.
 */
const BOARD = {
  businessTypes: {
    sklep: ['cart', 'green'],
    gastro: ['fork', 'red'],
    hotel: ['bed', 'violet'],
    biuro: ['calc', 'green'],
    warsztat: ['car', 'blue'],
    gabinet: ['cross', 'red'],
    szkola: ['cap', 'blue'],
    produkcja: ['factory', 'blue'],
    truck: ['truck', 'violet'],
    inna: ['plus', 'blue'],
  } as Record<string, [WizardIconName, (typeof WIZARD_TONES)[number]]>,
  needIcons: {
    kasa: 'register',
    pos: 'pos',
    term: 'terminal',
    prog: 'program',
    hotel: 'booking',
    ksef: 'ksef',
    komp: 'laptop',
    siec: 'wifi',
    kopie: 'backup',
    bezp: 'shield',
    av: 'screen',
    opieka: 'care',
    podpis: 'signature',
  } as Record<string, WizardIconName>,
  premisesCaptions: {
    nowy: 'otwieram firmę lub pierwszy raz kasa',
    dziala: 'firma już pracuje, coś zmieniamy',
  } as Record<string, string>,
  whenCaptions: {
    'Otwarcie lokalu': 'nowy start, wszystko od zera',
    'Przed sezonem': 'zima albo lato na Podhalu',
    'Jak najszybciej': 'coś nie działa albo pilna zmiana',
    'Na spokojnie': 'planuję na najbliższe miesiące',
  } as Record<string, string>,
  defaults: { salesPoints: '1', computers: '1–3', premises: 'nowy' },
  multiplyBySalesPoints: ['kasa', 'pos'],
  // „pos”: one string in the package („Wgranie menu (gastro) / Wgranie towarów”).
  posServices: [
    { needs: ['pos'], businessTypes: ['gastro' as const], text: 'Wgranie menu' },
    { needs: ['pos'], exceptBusinessTypes: ['gastro' as const], text: 'Wgranie towarów' },
  ],
  // TODO(krystian): [SZEF] „Terminal 0 zł przez 12 miesięcy (Polska Bezgotówkowa)” — warunki
  // programu bez źródła, plakietka pominięta; KSeF bez daty 1.01.2027 (ZMIANY-v20 §5); ulga
  // 700 zł — w paczce „DO POTWIERDZENIA”, spec. §11 chce linku do aktu.
  badges: [
    {
      needs: ['kasa'],
      premises: 'nowy',
      value: '700',
      text: 'Ulga do 700 zł na kasę online',
      caption: '90% ceny netto kasy, art. 111 ust. 4 ustawy o VAT',
    },
    {
      needs: ['ksef'],
      value: 'KSeF',
      text: 'Gotowe na KSeF',
      caption: 'program, certyfikat i uprawnienia',
    },
  ],
} as const

/** „gopos (GoPOS na Sunmi D3 PRO)” → `gopos`; names the package uses for its short ids. */
const SHORT_ID_ALIASES: Record<string, string> = {
  nfhotel: 'nfh',
  thinkpad: 'tp',
  thinkcentre: 'tc',
}

const shortIdOf = (value: string) => {
  const first = value.trim().split(/[\s(]/, 1)[0] ?? ''
  return SHORT_ID_ALIASES[first] ?? first
}

/**
 * Seed package + board → wizard rules in code names. `productSlug` turns a short id of the
 * package (`katalog.json`) into the product's slug; a proposal without a product is left out.
 */
export function wizardFromSeed(
  seed: SeedWizard,
  productSlug: (shortId: string) => string | undefined,
): unknown {
  const { zawsze, ...byNeed } = seed.uslugi_w_cenie
  const option = ({ id, nazwa, podpis }: { id: string; nazwa: string; podpis?: string }) => ({
    id,
    name: nazwa,
    ...(podpis && { caption: podpis }),
  })
  const proposals = Object.fromEntries(
    Object.entries(seed.propozycja_dla_potrzeby).map(([need, byType]) => [
      need,
      Object.fromEntries(
        Object.entries(byType).flatMap(([type, value]) => {
          const slug = productSlug(shortIdOf(value))
          return slug ? [[type, slug]] : []
        }),
      ),
    ]),
  )
  const serviceRules = Object.entries(byNeed).flatMap(([key, text]) =>
    key === 'pos' || typeof text !== 'string' ? [] : [{ needs: key.split('|'), text }],
  )
  return {
    steps: seed.kroki,
    businessTypes: seed.rodzaje_firm.map((type) => {
      const [typeIcon, tone] = BOARD.businessTypes[type.id] ?? ['plus', 'blue']
      return { ...option(type), icon: typeIcon, tone }
    }),
    needs: seed.potrzeby.map((need) => ({
      ...option(need),
      icon: BOARD.needIcons[need.id] ?? 'plus',
    })),
    defaultNeeds: seed.domyslne_potrzeby,
    scale: {
      salesPoints: {
        options: seed.skala.stanowiska_sprzedazy,
        default: BOARD.defaults.salesPoints,
      },
      computers: { options: seed.skala.komputery, default: BOARD.defaults.computers },
      premises: {
        options: Object.entries(seed.skala.lokal).map(([premisesId, name]) => ({
          id: premisesId,
          name,
          caption: BOARD.premisesCaptions[premisesId],
        })),
        default: BOARD.defaults.premises,
      },
      when: seed.skala.kiedy.map((name) => ({ name, caption: BOARD.whenCaptions[name] })),
    },
    proposals,
    multiplyBySalesPoints: [...BOARD.multiplyBySalesPoints],
    includedServices: {
      always: Array.isArray(zawsze) ? zawsze : zawsze ? [zawsze] : [],
      rules: [...serviceRules.slice(0, 1), ...BOARD.posServices, ...serviceRules.slice(1)],
    },
    badges: BOARD.badges,
  }
}
