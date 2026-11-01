import { z } from 'zod'

import type { NewCartItem } from '../../cart/cart'

/** Note of every position the GoPOS package adds to the inquiry (board: `n: 'Pakiet GoPOS'`). */
export const GOPOS_PACKAGE_NOTE = 'Pakiet GoPOS'

/** Step of the order the ticket shows before anything is picked: the kitchen (K32 §3). */
export const INITIAL_TICKET_STEP = 1

const text = z.string().trim().min(1)
const slug = z.string().trim().min(1).max(120)

export const goposModuleSchema = z.object({
  /** Product slug: the inquiry position and the link to the card. */
  slug,
  /** The system itself: always in the package, cannot be switched off. */
  core: z.boolean().optional(),
  name: text,
  text,
  /** Hardware the module needs („Sprzęt, który dobierzemy”). */
  hw: z.array(text).default([]),
})
export type GoposModule = z.infer<typeof goposModuleSchema>

const ticketSchema = z.object({
  label: text,
  text,
  /** Four statuses, one per step of the flow. */
  statuses: z.array(text).length(4),
})
export type GoposTicket = z.infer<typeof ticketSchema>

const flowStepSchema = z.object({ k: text, t: text, d: text })

/** `gopos-hero`: the H1 and lead are the block's own fields. */
export const goposHeroSchema = z.object({
  /** Breadcrumbs between „Strona główna” and the page (board: Start / Oferta / GoPOS). */
  trail: z
    .array(z.object({ name: text, href: text }))
    .max(2)
    .default([]),
  pill: text,
  /** „Umów prezentację”: the product it lists and the position's note. */
  presentation: z.object({ slug, note: text }),
  proof: z.array(z.object({ t: text, d: text })).max(4),
  /** Devices on the stage; `step` = the flow step they light up with. */
  stage: z.array(z.object({ slug, label: text, step: z.number().int().min(0).max(3) })).max(4),
  flow: z.array(flowStepSchema).length(4),
  ticket: ticketSchema,
})

/** `gopos-venues` (#lokal): one tab per kind of venue with its starting package. */
export const goposVenuesSchema = z.object({
  venues: z
    .array(
      z.object({
        key: text,
        tab: text,
        h1a: text,
        h1b: text,
        lead: text,
        /** Product slug of the picture. */
        image: slug.optional(),
        modules: z.array(z.object({ slug, name: text })).max(6),
        ticket: ticketSchema,
      }),
    )
    .min(1)
    .max(6),
})

const areaItemSchema = z.object({ t: text, d: text, slug: slug.optional() })

/**
 * Starting package before any click (the first venue's modules) and the core system's slug. The
 * sections that show the package each carry it, so each renders the same on its own.
 */
const packageStart = {
  initial: z.array(slug).max(14).default([]),
  core: slug.default('gopos'),
}

/** `gopos-areas` (#moduly): areas of the system, then the folded „Moduły rozszerzające”. */
export const goposAreasSchema = z.object({
  ...packageStart,
  areas: z
    .array(z.object({ t: text, items: z.array(areaItemSchema).min(1).max(10) }))
    .min(1)
    .max(6),
  ext: z.object({
    items: z
      .array(
        z.object({
          t: text,
          k: text,
          slug: slug.optional(),
          f: z.array(text).max(10),
          v: z.array(z.object({ n: text, d: text })).max(4),
        }),
      )
      .max(10),
    source: z.string().optional(),
  }),
})

/** `gopos-hub`: delivery apps into one queue. */
export const goposHubSchema = z.object({
  ...packageStart,
  hubSlug: slug,
  platforms: z.array(text).max(8),
  out: z.array(z.object({ t: text, d: text })).max(4),
})

/** `gopos-package` (#pakiet): the configurator and the folded Basic / Pro comparison. */
export const goposPackageSchema = z.object({
  ...packageStart,
  modules: z.array(goposModuleSchema).min(1).max(14),
  note: z.string().optional(),
  compare: z.object({
    head: z.array(z.string()).length(3),
    rows: z.array(z.tuple([text, text, text])).max(16),
    functions: z.array(text).max(16),
    addons: z.array(text).max(16),
    source: z.string().optional(),
  }),
})

/** Modules in the package: the core ones and the picked ones, in the list's order. */
export function packageModules(modules: readonly GoposModule[], picked: ReadonlySet<string>) {
  return modules.filter((module) => module.core || picked.has(module.slug))
}

/** Click on a module: in or out; the core system and unknown slugs do nothing. */
export function toggleModule(
  modules: readonly GoposModule[],
  picked: ReadonlySet<string>,
  slugToToggle: string,
): Set<string> {
  const next = new Set(picked)
  const found = modules.find((item) => item.slug === slugToToggle)
  if (!found || found.core) return next
  if (next.has(slugToToggle)) next.delete(slugToToggle)
  else next.add(slugToToggle)
  return next
}

/** A venue tab: the package becomes the venue's starting modules (known ones only). */
export function selectionForVenue(
  modules: readonly GoposModule[],
  venueModules: readonly string[],
): Set<string> {
  const known = new Set(modules.map((module) => module.slug))
  return new Set(venueModules.filter((item) => known.has(item)))
}

/** „Sprzęt, który dobierzemy”: hardware of the package, each once, in order. */
export function packageHardware(modules: readonly GoposModule[], picked: ReadonlySet<string>) {
  return [...new Set(packageModules(modules, picked).flatMap((module) => module.hw))]
}

/** „Zapytaj o ten pakiet”: one inquiry position per module of the package, with the note. */
export function packageItems(
  modules: readonly GoposModule[],
  picked: ReadonlySet<string>,
): NewCartItem[] {
  return packageModules(modules, picked).map((module) => ({
    id: module.slug,
    q: 1,
    uwaga: GOPOS_PACKAGE_NOTE,
  }))
}

/** Step the ticket shows: the picked one, the kitchen before any pick. */
export const ticketStep = (picked: number | null) => picked ?? INITIAL_TICKET_STEP
