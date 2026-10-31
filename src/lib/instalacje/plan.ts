import { z } from 'zod'

import { SERVICE_KEYS, type ServiceKey } from './options'

/*
 * Rules of the „Zaplanuj” planner (`zrodlo/pages/Zaplanuj.js`): objects, sizes, stages and the
 * question of each service. The browser shows them, the server checks the answers against them
 * and names them for the e-mail and the panel (ADR-I002 §4: answers → `wizard`).
 */

const SERVICE_ORDER: readonly ServiceKey[] = SERVICE_KEYS.map((s) => s.value)

export const serviceLabel = (key: ServiceKey) =>
  SERVICE_KEYS.find((s) => s.value === key)?.label ?? key

export function isServiceKey(value: string): value is ServiceKey {
  return (SERVICE_ORDER as readonly string[]).includes(value)
}

/** Objects of the planner (`OB`); other pages link with their own keys (`M`). */
export const PLANNER_OBJECTS = [
  { key: 'dom', label: 'Dom' },
  { key: 'pens', label: 'Pensjonat' },
  { key: 'apt', label: 'Apartament' },
  { key: 'hotel', label: 'Hotel' },
  { key: 'rest', label: 'Restauracja' },
  { key: 'sklep', label: 'Sklep' },
  { key: 'firma', label: 'Biuro lub hala' },
  { key: 'gmina', label: 'Szkoła, gmina, kościół' },
  { key: 'dew', label: 'Deweloper, wspólnota' },
] as const
export type PlannerObject = (typeof PLANNER_OBJECTS)[number]['key']

const OBJECT_ALIASES: Record<string, PlannerObject> = {
  dom: 'dom',
  apt: 'apt',
  pens: 'pens',
  hotel: 'hotel',
  rest: 'rest',
  sklep: 'sklep',
  firma: 'firma',
  biuro: 'firma',
  hala: 'firma',
  kosc: 'gmina',
  szk: 'gmina',
  gmina: 'gmina',
  inst: 'gmina',
  dev: 'dew',
  dew: 'dew',
  bud: 'dew',
}

export const PLAN_SIZES = [
  { label: 'Mały', hint: 'dom, lokal' },
  { label: 'Średni', hint: 'pensjonat, firma' },
  { label: 'Duży', hint: 'kilka budynków' },
] as const

export const PLAN_STAGES = [
  { label: 'Budowa', hint: 'stan surowy' },
  { label: 'Remont', hint: 'w trakcie' },
  { label: 'Działa', hint: 'obiekt gotowy' },
] as const

/** „Nie wiem” closes every list of answers (the prototype adds it to each question). */
export const DONT_KNOW = 'Nie wiem'

/** One question per service; the alarm brings a second one about the video intercom (`vd`). */
export const PLAN_QUESTIONS = {
  kam: { service: 'kam', q: 'Ile miejsc chcesz obserwować?', a: ['1–4', '5–8', '9–16', 'Więcej'] },
  alarm: { service: 'alarm', q: 'Jaki alarm?', a: ['Przewodowy', 'Bezprzewodowy'] },
  vd: { service: 'alarm', q: 'Czy dołożyć wideodomofon?', a: ['Tak', 'Nie'] },
  kd: { service: 'kd', q: 'Ile drzwi lub wejść?', a: ['1', '2–5', '6–20', 'Więcej'] },
  wifi: {
    service: 'wifi',
    q: 'Jak duży jest obiekt?',
    a: ['1 kondygnacja', '2–3 kondygnacje', 'Kilka budynków'],
  },
  tel: { service: 'tel', q: 'Masz przedmiar lub projekt?', a: ['Tak', 'W przygotowaniu'] },
  ev: { service: 'ev', q: 'Jakie masz przyłącze?', a: ['1 faza', '3 fazy'] },
  smart: {
    service: 'smart',
    q: 'Na jakim etapie jest elektryka?',
    a: ['Przed elektryką', 'W trakcie', 'Dom wykończony'],
  },
  ant: {
    service: 'ant',
    q: 'Co chcesz odbierać?',
    a: ['Satelita', 'Naziemna', 'Obie', 'Instalacja zbiorcza'],
  },
  snd: {
    service: 'snd',
    q: 'Jakie wnętrze?',
    a: ['Lokal', 'Sala do 200 osób', 'Kościół lub hala'],
  },
  scr: { service: 'scr', q: 'Ile ekranów?', a: ['1', '2–3', 'Więcej'] },
} as const satisfies Record<string, { service: ServiceKey; q: string; a: readonly string[] }>
export type QuestionKey = keyof typeof PLAN_QUESTIONS

/** Answers of a question, „Nie wiem” last. */
export const answersOf = (key: QuestionKey): string[] => [...PLAN_QUESTIONS[key].a, DONT_KNOW]

/** Questions of the chosen services, in their order (`QK`). */
export function questionKeys(services: readonly ServiceKey[]): QuestionKey[] {
  return services.flatMap((key): QuestionKey[] => (key === 'alarm' ? ['alarm', 'vd'] : [key]))
}

/** „Jak się skontaktować?” → `preferredContact` of the inquiry. */
export const PLAN_VIA = [
  { label: 'Telefon', contact: 'phone' },
  { label: 'WhatsApp', contact: 'whatsapp' },
  { label: 'E-mail', contact: 'email' },
] as const

export const PLAN_WHEN = ['Rano', 'Po południu', 'Obojętnie'] as const

// One line of free text: the configurator's values go into the office e-mail line by line.
const line = (max: number) =>
  z
    .string()
    .trim()
    .min(1)
    .max(max)
    .regex(/^[^\r\n]*$/)

/** The configured charger from the Ładowarki page (`konf`, ADR-I002 §4). */
const chargerSchema = z.strictObject({
  model: line(120),
  punkty: z.number().int().min(1).max(50),
  mocNaPunkt: line(60),
  wyjscie: line(120),
  montaz: line(120),
  kolor: line(60).optional(),
})
export type PlanCharger = z.infer<typeof chargerSchema>

const index = (length: number) =>
  z
    .number()
    .int()
    .min(0)
    .max(length - 1)

const answersSchema = z
  .strictObject({
    services: z
      .array(z.string().refine(isServiceKey))
      .max(SERVICE_ORDER.length)
      .refine((list) => new Set(list).size === list.length, 'repeated service'),
    unsure: z.boolean().default(false),
    object: z.enum(PLANNER_OBJECTS.map((o) => o.key)).optional(),
    size: index(PLAN_SIZES.length).optional(),
    stage: index(PLAN_STAGES.length).optional(),
    answers: z.record(z.string(), z.number().int().min(0)),
    charger: chargerSchema.optional(),
    via: index(PLAN_VIA.length),
    when: index(PLAN_WHEN.length).optional(),
  })
  .superRefine((data, ctx) => {
    const services = data.services as ServiceKey[]
    // „Nie wiem, doradźcie mi” clears the services in the planner: one or the other.
    if ((services.length === 0) !== data.unsure) {
      ctx.addIssue({ code: 'custom', path: ['services'], message: 'services or unsure' })
    }
    const asked = new Set<string>(questionKeys(services))
    for (const [key, value] of Object.entries(data.answers)) {
      if (!asked.has(key) || value >= answersOf(key as QuestionKey).length) {
        ctx.addIssue({ code: 'custom', path: ['answers', key], message: 'unknown answer' })
      }
    }
    if (data.charger && !services.includes('ev')) {
      ctx.addIssue({ code: 'custom', path: ['charger'], message: 'charger only with EV' })
    }
  })

export type PlanAnswers = Omit<z.infer<typeof answersSchema>, 'services' | 'answers'> & {
  services: ServiceKey[]
  answers: Partial<Record<QuestionKey, number>>
}

/** The planner's answers as sent in `wizard`, or `null` when they do not fit the rules. */
export function parsePlanAnswers(input: unknown): PlanAnswers | null {
  const result = answersSchema.safeParse(input)
  return result.success ? (result.data as PlanAnswers) : null
}

export const planContact = ({ via }: Pick<PlanAnswers, 'via'>) => PLAN_VIA[via]!.contact

/** The prototype's `norm()`: lower case, no Polish letters, only letters, digits and spaces. */
export function norm(text: string): string {
  const map: Record<string, string> = {
    ą: 'a',
    ć: 'c',
    ę: 'e',
    ł: 'l',
    ń: 'n',
    ó: 'o',
    ś: 's',
    ź: 'z',
    ż: 'z',
  }
  return text
    .toLowerCase()
    .replace(/[ąćęłńóśźż]/g, (c) => map[c] ?? c)
    .replace(/[^a-z0-9 ]+/g, ' ')
    .trim()
}

/** Travel zone of a town (1:1 with the prototype's patterns); `null` without a town. */
export function travelZone(town: string): string | null {
  const t = norm(town)
  if (!t) return null
  if (/rabk|chabow|jordan|mszan|raba|spytk|lubien|skomiel|niedzwi|ponic|olszow/.test(t)) {
    return 'Rabka-Zdrój i okolice'
  }
  if (/zakop|poron|koscieli|bukow|bialk|bialy dun|murzas/.test(t)) return 'Zakopane i Tatry'
  if (/nowy targ|nowy tar|szaflar|czarny dun|jablon|czorszt|szczawn|kroscien|orawa|spisz/.test(t)) {
    return 'Podhale'
  }
  return 'Małopolska · dojazd ustalimy'
}

/** The charger as lines of the summary (the kreator's „Szczegóły” step shows the same). */
export function chargerLines(c: PlanCharger): string[] {
  return [
    `Model: ${c.model}`,
    `Punkty ładowania: ${c.punkty}`,
    `Moc na punkt: ${c.mocNaPunkt}`,
    `Wyjście: ${c.wyjscie}`,
    `Montaż: ${c.montaz}`,
    ...(c.kolor ? [`Kolor: ${c.kolor}`] : []),
  ]
}

/** The answers named for people — what the e-mail and the panel show (`wizard`). */
export function planSummary(
  answers: PlanAnswers,
  city: string | undefined,
): Record<string, string | string[]> {
  const summary: Record<string, string | string[]> = {
    Instalacje: answers.services.length ? answers.services.map(serviceLabel) : 'Do doradzenia',
  }
  const object = PLANNER_OBJECTS.find((o) => o.key === answers.object)
  if (object) summary.Obiekt = object.label
  const size = answers.size === undefined ? undefined : PLAN_SIZES[answers.size]
  if (size) summary['Wielkość'] = `${size.label} (${size.hint})`
  const stage = answers.stage === undefined ? undefined : PLAN_STAGES[answers.stage]
  if (stage) summary.Etap = `${stage.label} (${stage.hint})`
  for (const key of questionKeys(answers.services)) {
    const value = answers.answers[key]
    if (value === undefined) continue
    const question = PLAN_QUESTIONS[key]
    summary[`${serviceLabel(question.service)} — ${question.q}`] = answersOf(key)[value]!
  }
  if (answers.charger) summary['Ładowarka'] = chargerLines(answers.charger)
  const zone = city ? travelZone(city) : null
  if (zone) summary['Strefa dojazdu'] = zone
  summary['Kontakt przez'] = PLAN_VIA[answers.via]!.label
  if (answers.when !== undefined) summary['Pora kontaktu'] = PLAN_WHEN[answers.when]!
  return summary
}

/** base64url JSON → charger, `null` when it is not a valid one (same in the browser and Node). */
function decodeCharger(konf: string): PlanCharger | null {
  try {
    const binary = atob(konf.replace(/-/g, '+').replace(/_/g, '/'))
    const json: unknown = JSON.parse(
      new TextDecoder().decode(Uint8Array.from(binary, (c) => c.charCodeAt(0))),
    )
    const result = chargerSchema.safeParse(json)
    return result.success ? result.data : null
  } catch {
    return null
  }
}

export type PlanHashState = {
  object?: PlannerObject
  services?: ServiceKey[]
  charger?: PlanCharger
}

/**
 * The choices other pages pass in the address (`mountPage()`): `#obiekt=pens&uslugi=kam,wifi`
 * and the charger from Ładowarki (`konf`). Unknown keys are ignored; services in planner order.
 */
export function planHashState(hash: string): PlanHashState {
  let h: string
  try {
    h = decodeURIComponent(hash).replace(/^#/, '')
  } catch {
    return {}
  }
  const state: PlanHashState = {}
  const object = /(?:^|&)obiekt=([a-z]+)/.exec(h)?.[1]
  if (object && Object.hasOwn(OBJECT_ALIASES, object)) state.object = OBJECT_ALIASES[object]
  const listed = /(?:^|&)uslugi=([a-z,]+)/.exec(h)?.[1]?.split(',') ?? []
  const services = SERVICE_ORDER.filter((key) => listed.includes(key))
  if (services.length) state.services = services
  const konf = /(?:^|&)konf=([A-Za-z0-9_-]+)/.exec(h)?.[1]
  const charger = konf && services.includes('ev') ? decodeCharger(konf) : null
  if (charger) state.charger = charger
  return state
}
