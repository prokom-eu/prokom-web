import { z } from 'zod'

import { ICON_NAMES } from '../../shared/icons'
import {
  aboutHeroSchema,
  audienceSchema,
  brandsSchema,
  careAreasSchema,
  careHeroSchema,
  contactFormSchema,
  contactHeroSchema,
  linesSchema,
  seatsSchema,
  careReviewSchema,
  startCalendarSchema,
  switchStepsSchema,
} from './firma'
import {
  appMockupSchema,
  catalogTabsSchema,
  noticeSchema,
  sourcesSchema,
  ulgaHeroSchema,
  vendingHeroSchema,
  vendingPickerSchema,
  yesNoSchema,
} from './k4j'
import { ksefHeroSchema, ksefPenaltiesSchema, ksefQuizSchema, ksefStepsSchema } from './ksef'
import {
  goposAreasSchema,
  goposHeroSchema,
  goposHubSchema,
  goposPackageSchema,
  goposVenuesSchema,
} from './gopos'
import {
  insertHeroSchema,
  insertKsefSchema,
  insertPickerSchema,
  insertPointsSchema,
  insertRequirementsSchema,
} from './insert'

const text = z.string().trim().min(1)
const slug = z.string().trim().min(1).max(120)

/**
 * Button of a section: a link, or „add to the inquiry” (product slug and the position's note).
 * `primary` = the filled button; the rest are outlined.
 */
export const sectionActionSchema = z.union([
  z.object({ label: text, href: text, primary: z.boolean().optional() }),
  z.object({
    label: text,
    add: slug,
    note: z.string().max(200).optional(),
    primary: z.boolean().optional(),
  }),
])
export type SectionAction = z.infer<typeof sectionActionSchema>

const actionsSchema = z.object({
  actions: z.array(sectionActionSchema).max(3).default([]),
  /** From this day (Poland) the band shows another heading (KSeF after 1.01.2027 — D-K4-7). */
  after: z
    .object({ date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/), heading: z.string().trim().min(1) })
    .optional(),
})

/** `videos`: producer's films behind a facade (ADR-016). */
const videosSchema = z.object({
  label: text,
  note: z.string().optional(),
  /** Product whose photo is the frame of the poster (Web-gopos: the All in One, Web-insert: the
   * nexo box); without it the poster is the plain navy one. */
  poster: z.string().trim().min(1).max(120).optional(),
  videos: z
    .array(z.object({ id: z.string().regex(/^[\w-]{6,20}$/), t: text, k: text }))
    .min(1)
    .max(8),
})

/** `bundles`: ready bundles by slug, in this order (GoPOS „Gotowe zestawy dla gastronomii”). */
const bundlesSchema = z.object({
  slugs: z.array(z.string().trim().min(1).max(120)).min(1).max(6),
})

/** `table`: a comparison; on a phone each column becomes a card. */
const tableSchema = z.object({
  head: z.array(text).min(2).max(4),
  rows: z.array(z.object({ k: text, v: z.array(text) })).max(12),
  /** Two value columns as „without” and „with” (board `Web-opieka-it`): red ✕ and green ✓. */
  contrast: z.boolean().optional(),
  /** Cards under the table (InsERT „Linie InsERT”, PREMIUM-1011): name, tagline, points. */
  lines: z
    .object({
      t: text,
      items: z
        .array(z.object({ t: text, s: text, b: z.array(text).max(4) }))
        .min(1)
        .max(4),
      source: z.string().optional(),
    })
    .optional(),
})

/** `tabs`: groups of entries (InsERT „Cała oferta”); an entry may link to its product card. */
const tabsSchema = z.object({
  tabs: z
    .array(
      z.object({
        t: text,
        items: z
          .array(z.object({ t: text, l: z.string().optional(), d: text, slug: slug.optional() }))
          .min(1)
          .max(12),
      }),
    )
    .min(1)
    .max(12),
})

/** `chips`: groups of short labels (GoPOS integrations) with an optional total tile. */
const chipsSchema = z.object({
  groups: z
    .array(
      z.object({
        t: text,
        items: z.array(text).min(1).max(10),
        /** Icon of the group's kind (PRODUKCJA-BIZNES-1211 §3: tiles, not bare chips). */
        ic: z.enum(ICON_NAMES).optional(),
      }),
    )
    .max(10),
  total: z.object({ v: text, t: text }).optional(),
  /** Groups shown before „Pokaż wszystkie”; 0 = all. */
  visible: z.number().int().min(0).default(0),
})

/** `products`: catalog cards by slug, in this order; `visible` before „Pokaż wszystkie”. */
const productsSchema = z.object({
  slugs: z.array(slug).min(1).max(24),
  visible: z.number().int().min(0).default(0),
})

const empty = z.object({}).passthrough()

/**
 * `cards`: an optional picture per card, by the card's position (PRODUKCJA-BIZNES-1211 §3 — real
 * GoPOS screens): `phone` — a screen in a phone frame, `screen` — a device photo, `doc` — a drawn
 * invoice (no image). `null` = a card without a picture.
 */
const cardsSchema = z
  .object({
    shots: z
      .array(
        z
          .object({
            frame: z.enum(['phone', 'screen', 'doc']),
            image: z.number().int().positive().optional(),
          })
          .nullable(),
      )
      .max(16)
      .optional(),
  })
  .passthrough()

/** `stepsSchema`: `axis` draws the steps on one line with numbered stops (GoPOS rollout). */
const stepsSchema = z.object({ axis: z.boolean().optional() }).passthrough()

/**
 * Kinds of the K4 section (`bzSection`, decyzja Krystiana 01.11 — hybryda): texts, cards and
 * FAQ are the block's fields, the data of a widget is JSON checked by its schema here.
 */
export const SECTION_SCHEMAS = {
  // Shared kinds: the block's items carry the content.
  stats: empty,
  cards: cardsSchema,
  steps: stepsSchema,
  cases: empty,
  band: actionsSchema,
  videos: videosSchema,
  table: tableSchema,
  tabs: tabsSchema,
  chips: chipsSchema,
  products: productsSchema,
  bundles: bundlesSchema,
  // GoPOS (K4h).
  'gopos-hero': goposHeroSchema,
  'gopos-venues': goposVenuesSchema,
  'gopos-areas': goposAreasSchema,
  'gopos-hub': goposHubSchema,
  'gopos-package': goposPackageSchema,
  // InsERT (K4h).
  'insert-hero': insertHeroSchema,
  'insert-picker': insertPickerSchema,
  'insert-ksef': insertKsefSchema,
  'insert-points': insertPointsSchema,
  'insert-requirements': insertRequirementsSchema,
  // Opieka IT, O firmie, Kontakt (K4i).
  'care-hero': careHeroSchema,
  'care-areas': careAreasSchema,
  'switch-steps': switchStepsSchema,
  audience: audienceSchema,
  'start-calendar': startCalendarSchema,
  'care-review': careReviewSchema,
  seats: seatsSchema,
  'about-hero': aboutHeroSchema,
  lines: linesSchema,
  brands: brandsSchema,
  'contact-hero': contactHeroSchema,
  'contact-form': contactFormSchema,
  // Automaty, KSeF, ulga (K4j).
  'vending-hero': vendingHeroSchema,
  'vending-picker': vendingPickerSchema,
  'app-mockup': appMockupSchema,
  'catalog-tabs': catalogTabsSchema,
  sources: sourcesSchema,
  'ksef-hero': ksefHeroSchema,
  'ksef-quiz': ksefQuizSchema,
  'ksef-steps': ksefStepsSchema,
  'ksef-penalties': ksefPenaltiesSchema,
  'ulga-hero': ulgaHeroSchema,
  'yes-no': yesNoSchema,
  notice: noticeSchema,
} as const

export type SectionVariant = keyof typeof SECTION_SCHEMAS
export type SectionData<V extends SectionVariant> = z.infer<(typeof SECTION_SCHEMAS)[V]>

export const SECTION_VARIANTS: readonly { value: SectionVariant; label: string }[] = [
  { value: 'stats', label: 'Liczby ze źródłem' },
  { value: 'cards', label: 'Karty' },
  { value: 'steps', label: 'Kroki' },
  { value: 'cases', label: 'Wyniki klientów' },
  { value: 'band', label: 'Pasek z przyciskami' },
  { value: 'videos', label: 'Filmy' },
  { value: 'table', label: 'Tabela porównania' },
  { value: 'tabs', label: 'Zakładki z pozycjami' },
  { value: 'chips', label: 'Grupy etykiet (integracje)' },
  { value: 'products', label: 'Produkty z katalogu' },
  { value: 'bundles', label: 'Gotowe zestawy' },
  { value: 'gopos-hero', label: 'GoPOS: hero' },
  { value: 'gopos-venues', label: 'GoPOS: Twój lokal' },
  { value: 'gopos-areas', label: 'GoPOS: obszary i moduły' },
  { value: 'gopos-hub', label: 'GoPOS: GoHub' },
  { value: 'gopos-package', label: 'GoPOS: konfigurator pakietu' },
  { value: 'insert-hero', label: 'InsERT: hero' },
  { value: 'insert-picker', label: 'InsERT: który Subiekt' },
  { value: 'insert-ksef', label: 'InsERT: KSeF' },
  { value: 'insert-points', label: 'InsERT: InsPunkty' },
  { value: 'insert-requirements', label: 'InsERT: wymagania' },
  { value: 'care-hero', label: 'Opieka IT: hero z raportem' },
  { value: 'care-areas', label: 'Opieka IT: obszary' },
  { value: 'switch-steps', label: 'Kroki z przełącznikiem' },
  { value: 'audience', label: 'Dla kogo' },
  { value: 'start-calendar', label: 'Na start i terminy' },
  { value: 'care-review', label: 'Opieka IT: bezpłatny przegląd' },
  { value: 'seats', label: 'Ile masz stanowisk?' },
  { value: 'about-hero', label: 'O firmie: hero z wizytówką' },
  { value: 'lines', label: 'Linie PRO-KOM' },
  { value: 'brands', label: 'Marki i autoryzacje' },
  { value: 'contact-hero', label: 'Kontakt: hero' },
  { value: 'contact-form', label: 'Kontakt: formularz' },
  { value: 'vending-hero', label: 'Automaty: hero' },
  { value: 'vending-picker', label: 'Automaty: co sprzedawać' },
  { value: 'app-mockup', label: 'Aplikacja w telefonie' },
  { value: 'catalog-tabs', label: 'Produkty kategorii w zakładkach' },
  { value: 'sources', label: 'Źródła' },
  { value: 'ksef-hero', label: 'KSeF: hero (dwie wersje)' },
  { value: 'ksef-quiz', label: 'KSeF: czy mnie dotyczy' },
  { value: 'ksef-steps', label: 'KSeF: 6 kroków' },
  { value: 'ksef-penalties', label: 'KSeF: kary i pomoc' },
  { value: 'ulga-hero', label: 'Ulga: hero' },
  { value: 'yes-no', label: 'Przysługuje / nie przysługuje' },
  { value: 'notice', label: 'Lista z kartą boczną' },
]

/** Kinds that open the page: they carry the H1 and the breadcrumbs. */
export const HERO_VARIANTS: ReadonlySet<SectionVariant> = new Set([
  'gopos-hero',
  'insert-hero',
  'care-hero',
  'about-hero',
  'contact-hero',
  'vending-hero',
  'ksef-hero',
  'ulga-hero',
])

export const isSectionVariant = (value: unknown): value is SectionVariant =>
  typeof value === 'string' && Object.hasOwn(SECTION_SCHEMAS, value)

/** Data of the kind, or `null` when it does not match (the section is then not shown). */
export function parseSectionData<V extends SectionVariant>(
  variant: V,
  data: unknown,
): SectionData<V> | null {
  const result = SECTION_SCHEMAS[variant].safeParse(data ?? {})
  return result.success ? (result.data as SectionData<V>) : null
}

/** Panel check of the JSON field against the kind picked next to it. */
export function validateSectionData(value: unknown, variant: unknown): true | string {
  if (!isSectionVariant(variant)) return 'Wybierz rodzaj sekcji.'
  const result = SECTION_SCHEMAS[variant].safeParse(value ?? {})
  if (result.success) return true
  const [issue] = result.error.issues
  return `Dane sekcji: ${issue?.path.join('.') || '(całość)'} — ${issue?.message ?? 'błąd'}`
}
