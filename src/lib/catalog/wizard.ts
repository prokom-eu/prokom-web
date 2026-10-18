import { z } from 'zod'

import { WIZARD_BUSINESS_TYPES } from './options'

/**
 * Rules of the offer wizard (`/kreator`, spec. §6.8), kept as one JSON value in
 * `BiznesSettings.wizard` (B1b decision: nested rules, rarely edited — a JSON field
 * checked by this schema instead of panel forms). The wizard itself is built in B10.
 */

const BUSINESS_TYPE_IDS = WIZARD_BUSINESS_TYPES.map((type) => type.value) as [
  (typeof WIZARD_BUSINESS_TYPES)[number]['value'],
  ...(typeof WIZARD_BUSINESS_TYPES)[number]['value'][],
]

const businessTypeId = z.enum(BUSINESS_TYPE_IDS)
const id = z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
const label = z.string().trim().min(1).max(120)

const option = <T extends z.ZodType>(idSchema: T) =>
  z.object({ id: idSchema, name: label, caption: z.string().trim().max(200).optional() })

export const wizardSchema = z
  .object({
    steps: z.array(label).min(1),
    businessTypes: z.array(option(businessTypeId)).min(1),
    needs: z.array(option(id)).min(1),
    /** Needs ticked at the start for a business type. */
    defaultNeeds: z.partialRecord(businessTypeId, z.array(id)),
    /** Answers of the "scale" step (counts, new or running business, when). */
    scale: z.object({
      salesPoints: z.array(label),
      computers: z.array(label),
      premises: z.array(z.object({ id, name: label })),
      when: z.array(label),
    }),
    /**
     * Proposal per need and business type (`*` = any other type): a product slug or legacy id
     * of the catalog, or a short description until the product exists.
     */
    proposals: z.record(id, z.partialRecord(z.union([businessTypeId, z.literal('*')]), label)),
    /** Services always included, and per need (`a|b` = any of the needs). */
    includedServices: z.object({
      always: z.array(label),
      byNeed: z.record(z.string().regex(/^[a-z0-9-]+(?:\|[a-z0-9-]+)*$/), label),
    }),
    /** Badges shown when a condition holds; facts need a source before publishing (spec. §1). */
    badges: z.array(
      z.object({ when: label, text: label, status: z.string().trim().max(120).optional() }),
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
    for (const key of Object.keys(wizard.includedServices.byNeed)) {
      for (const needId of key.split('|')) check(needId, ['includedServices', 'byNeed', key])
    }
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
  plakietki: { gdy: string; tekst: string; status?: string }[]
}

/** Seed package → wizard rules in code names; the B2 import stores the result. */
export function wizardFromSeed(seed: SeedWizard): unknown {
  const { zawsze, ...byNeed } = seed.uslugi_w_cenie
  const toOption = ({ id, nazwa, podpis }: { id: string; nazwa: string; podpis?: string }) => ({
    id,
    name: nazwa,
    ...(podpis && { caption: podpis }),
  })
  return {
    steps: seed.kroki,
    businessTypes: seed.rodzaje_firm.map(toOption),
    needs: seed.potrzeby.map(toOption),
    defaultNeeds: seed.domyslne_potrzeby,
    scale: {
      salesPoints: seed.skala.stanowiska_sprzedazy,
      computers: seed.skala.komputery,
      premises: Object.entries(seed.skala.lokal).map(([id, name]) => ({ id, name })),
      when: seed.skala.kiedy,
    },
    proposals: seed.propozycja_dla_potrzeby,
    includedServices: {
      always: Array.isArray(zawsze) ? zawsze : zawsze ? [zawsze] : [],
      byNeed,
    },
    badges: seed.plakietki.map(({ gdy, tekst, status }) => ({
      when: gdy,
      text: tekst,
      ...(status && { status }),
    })),
  }
}
