import { z } from 'zod'

import type { IconName } from '../catalog/options'
import type { OfferView, RelatedCard } from './offer'
import { firstIssue, label, obj } from './schema'

/**
 * Page of one solution `/rozwiazania/[slug]` (spec. §6.1, board `Rozwiazanie`, ADR-014 SW2a
 * pkt 5). A solution with its own texts (`Solutions.page`) shows them; every other one falls back
 * to what the offer window already says (`OfferView`) — so all published solutions have a page,
 * and the window and the page never tell two stories. Pure: the route reads, this composes.
 */

// --- clickable demo (`Solutions.page.demo`, JSON) ---

/**
 * Data of the clickable phone demo. One kind today — the field crew app (board `Rozwiazanie`);
 * the mechanics and the fictitious board stay in the component, the texts a client reads here.
 */
export const solutionDemoSchema = obj({
  kind: z.literal('fieldCrew'),
  /** Four steps of the job: `[number, name]`. */
  steps: z.array(z.tuple([z.string().trim().min(1).max(4), label])).length(4),
  /** Four tasks ticked off on site. */
  tasks: z.array(label).length(4),
  /** Three cards under the demo: what happens, step by step. */
  flow: z.array(obj({ title: label, text: label })).length(3),
  /** Box under the demo („To nie jest film…”). */
  intro: obj({ eyebrow: label, title: label, lead: label }),
})

export type SolutionDemo = z.infer<typeof solutionDemoSchema>

export function validateSolutionDemo(value: unknown): true | string {
  return firstIssue(solutionDemoSchema, value, 'Demo telefonu')
}

// --- page view ---

/** What the route reads of `Solutions.page` (texts already filled with facts; `null` = none). */
export type SolutionPageDoc = {
  eyebrow?: string | null
  title?: string | null
  titleAccent?: string | null
  lead?: string | null
  priceCaption?: string | null
  tiles?: readonly { label: string; value: string; caption?: string | null }[] | null
  compare?: readonly { label: string; title: string; text?: string | null }[] | null
  deliverablesTitle?: string | null
  deliverables?: readonly { title: string; text?: string | null; icon?: string | null }[] | null
  choice?: {
    title?: string | null
    note?: string | null
    options?:
      | readonly {
          name: string
          caption?: string | null
          plus?: readonly string[] | null
          minus?: readonly string[] | null
        }[]
      | null
  } | null
  faqEyebrow?: string | null
  faq?: readonly { q: string; a: string }[] | null
  contact?: {
    eyebrow?: string | null
    title?: string | null
    lead?: string | null
    quoteCaption?: string | null
  } | null
  demo?: unknown
}

export type PageTile = { label: string; value: string; caption: string | null; accent: boolean }

export type SolutionPageView = {
  slug: string
  name: string
  eyebrow: string
  /** H1: the plain part and the accent (gradient) part; the accent may be empty. */
  title: { plain: string; accent: string | null }
  lead: string | null
  thumbnail: string | null
  /** Background of a missing thumbnail (`--grad-area-<tone>`). */
  tone: OfferView['tone']
  tiles: PageTile[]
  demo: SolutionDemo | null
  compare: { label: string; title: string; text: string | null }[]
  deliverables: {
    title: string
    /** Price badge next to the title: „od 2 490 zł netto” / „Zapytaj o wycenę”. */
    badge: { value: string; caption: string }
    items: { title: string; text: string | null; icon: IconName | null }[]
    /** „Wyceniane osobno” (`moreExamples`). */
    extra: string[]
  }
  example: string | null
  /** „Jak to wygląda” — only pages without the demo (the demo shows it). */
  steps: OfferView['steps']
  /** The page has `#jak-dziala` (demo, steps or example): the hero links to it only then. */
  howItWorks: boolean
  choice: {
    title: string
    note: string | null
    options: { name: string; caption: string | null; plus: string[]; minus: string[] }[]
  } | null
  related: RelatedCard[]
  faq: { eyebrow: string; items: { question: string; answer: string }[] }
  contact: {
    eyebrow: string | null
    title: string | null
    lead: string | null
    quoteCaption: string | null
  }
  /** For `Service.offers`: only a solution with a price (spec. §6.1). */
  priceFrom: number | null
  /** For „Chcę takie u siebie”: the name saved in „Twój projekt”. */
  projectName: string
}

type BuildInput = {
  view: OfferView
  page: SolutionPageDoc | null
  priceFrom: number | null
  /** One-line price from the price templates (`priceLine`): „od 2 490 zł netto”, „Zapytaj o wycenę”. */
  price: string
  moreExamples: readonly string[]
  isIcon: (value: string) => value is IconName
}

const ASK_CAPTION = 'po krótkiej rozmowie, na piśmie'
const PRICE_CAPTION = 'wycena na piśmie, ważna 30 dni'

const clean = (value: string | null | undefined): string | null => value?.trim() || null

/** The tiles next to the hero: price first (always from `Solutions`), then the page's own. */
function tilesOf(
  view: OfferView,
  page: SolutionPageDoc | null,
  price: string,
  priceFrom: number | null,
) {
  const priceTile: PageTile = {
    label: 'Cena',
    value: price,
    caption: clean(page?.priceCaption) ?? (priceFrom === null ? ASK_CAPTION : PRICE_CAPTION),
    accent: priceFrom === null,
  }
  const own = (page?.tiles ?? []).flatMap((tile) =>
    clean(tile.label) && clean(tile.value) ? [tile] : [],
  )
  const ownTiles = own.map((tile) => ({
    label: tile.label,
    value: tile.value,
    caption: clean(tile.caption),
    accent: false,
  }))
  if (ownTiles.length > 0) return [priceTile, ...ownTiles.slice(0, 3)]
  const fallback: PageTile[] = [
    { label: view.termLabel, value: view.term, caption: null, accent: false },
  ]
  if (view.forWhomShort) {
    fallback.push({ label: 'Dla kogo', value: view.forWhomShort, caption: null, accent: false })
  }
  return [priceTile, ...fallback]
}

function deliverablesOf(
  view: OfferView,
  page: SolutionPageDoc | null,
  isIcon: BuildInput['isIcon'],
) {
  const own = (page?.deliverables ?? [])
    .flatMap((item) => (clean(item.title) ? [item] : []))
    .map((item) => ({
      title: item.title,
      text: clean(item.text),
      icon: item.icon && isIcon(item.icon) ? item.icon : null,
    }))
  if (own.length > 0) return own
  const included = view.price.kind === 'included' ? view.price.items : []
  const titles = [...included, ...view.benefits.items]
  return [...new Set(titles)].map((title) => ({ title, text: null, icon: null }))
}

function choiceOf(page: SolutionPageDoc | null): SolutionPageView['choice'] {
  const options = (page?.choice?.options ?? [])
    .flatMap((option) => (clean(option.name) ? [option] : []))
    .map((option) => ({
      name: option.name,
      caption: clean(option.caption),
      plus: [...(option.plus ?? [])],
      minus: [...(option.minus ?? [])],
    }))
  const title = clean(page?.choice?.title)
  return title && options.length > 0 ? { title, note: clean(page?.choice?.note), options } : null
}

/** H1 of a page without its own: the name, no accent. */
function titleOf(view: OfferView, page: SolutionPageDoc | null): SolutionPageView['title'] {
  const plain = clean(page?.title)
  return plain ? { plain, accent: clean(page?.titleAccent) } : { plain: view.name, accent: null }
}

export function buildSolutionPage({
  view,
  page,
  priceFrom,
  price,
  moreExamples,
  isIcon,
}: BuildInput): SolutionPageView {
  // Spec. §6.1: the demo only for a solution with a live preview and its own demo.
  const demo = view.hasLivePreview ? (solutionDemoSchema.safeParse(page?.demo).data ?? null) : null
  const pageFaq = (page?.faq ?? []).flatMap(({ q, a }) =>
    clean(q) && clean(a) ? [{ question: q, answer: a }] : [],
  )
  const steps = demo ? [] : view.steps
  const windowFaq = view.faq.map(({ q, a }) => ({ question: q, answer: a }))
  const eyebrow =
    clean(page?.eyebrow) ?? ([view.label, view.forWhom].filter(Boolean).join(' · ') || null)
  return {
    slug: view.slug,
    name: view.name,
    eyebrow: eyebrow ?? view.categoryName,
    title: titleOf(view, page),
    lead: clean(page?.lead) ?? clean(view.lead),
    thumbnail: view.thumbnail ?? null,
    tone: view.tone,
    tiles: tilesOf(view, page, price, priceFrom),
    demo,
    compare: (page?.compare ?? [])
      .flatMap((item) => (clean(item.label) && clean(item.title) ? [item] : []))
      .map((item) => ({
        label: item.label,
        title: item.title,
        text: clean(item.text),
      })),
    deliverables: {
      title: clean(page?.deliverablesTitle) ?? view.benefits.title,
      badge: { value: price, caption: priceFrom === null ? ASK_CAPTION : view.term },
      items: deliverablesOf(view, page, isIcon),
      extra: moreExamples.map((item) => item.trim()).filter(Boolean),
    },
    example: view.example,
    steps,
    howItWorks: demo !== null || steps.length > 0 || Boolean(view.example),
    choice: choiceOf(page),
    related: view.related,
    faq: {
      eyebrow: clean(page?.faqEyebrow) ?? 'Pytania o to rozwiązanie',
      items: pageFaq.length > 0 ? pageFaq : windowFaq,
    },
    contact: {
      eyebrow: clean(page?.contact?.eyebrow),
      title: clean(page?.contact?.title),
      lead: clean(page?.contact?.lead),
      quoteCaption: clean(page?.contact?.quoteCaption),
    },
    priceFrom,
    projectName: view.name,
  }
}
