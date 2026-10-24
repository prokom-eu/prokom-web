import { z } from 'zod'

import type { BusinessTypeId, Wizard, WizardIconName } from './wizard'

/**
 * The kit of the offer wizard (spec. §6.8) from its rules (`BiznesSettings.wizard`) and the
 * customer's answers. The same function draws the live panel in the browser and composes the
 * inquiry on the server, so what the office gets is what the customer saw.
 */

export type WizardAnswers = {
  businessType: BusinessTypeId
  salesPoints: string
  computers: string
  premises: string
  needs: string[]
  /** „Na kiedy?” — optional, chosen in the last step. */
  when?: string
}

/** A published product of this site, as far as the kit shows it. */
export type KitProduct = {
  slug: string
  name: string
  benefit?: string
  image?: { url: string; alt: string; width: number; height: number }
}

export type KitItem = {
  need: string
  /** `null` while the proposal has no published product here: the need itself is shown. */
  slug: string | null
  name: string
  caption: string | null
  quantity: number
  icon: WizardIconName
  image?: KitProduct['image']
}

export type Kit = {
  items: KitItem[]
  services: string[]
  badges: Wizard['badges']
}

/** The start of the wizard for a business type: its default needs, the scale's defaults. */
export function defaultAnswers(rules: Wizard, businessType: BusinessTypeId): WizardAnswers {
  return {
    businessType,
    salesPoints: rules.scale.salesPoints.default,
    computers: rules.scale.computers.default,
    premises: rules.scale.premises.default,
    needs: [...(rules.defaultNeeds[businessType] ?? [])],
  }
}

/** „2” → 2, „4+” → 4; „0” and „1” → one piece. */
const quantityOf = (salesPoints: string) => Math.max(1, Number.parseInt(salesPoints, 10) || 1)

export function buildKit(
  rules: Wizard,
  answers: WizardAnswers,
  product: (slug: string) => KitProduct | undefined,
): Kit {
  const chosen = new Set(answers.needs)
  const multiplied = new Set(rules.multiplyBySalesPoints)
  const needs = new Map(rules.needs.map((need) => [need.id, need]))
  // In the order the customer ticked them (the type's defaults first), as on the board.
  const items = answers.needs
    .flatMap((needId) => {
      const need = needs.get(needId)
      return need ? [need] : []
    })
    .map((need): KitItem => {
      const byType = rules.proposals[need.id]
      const slug = byType?.[answers.businessType] ?? byType?.['*']
      const found = slug ? product(slug) : undefined
      return {
        need: need.id,
        slug: found?.slug ?? null,
        name: found?.name ?? need.name,
        caption: (found ? found.benefit : need.caption) ?? null,
        quantity: multiplied.has(need.id) ? quantityOf(answers.salesPoints) : 1,
        icon: need.icon,
        ...(found?.image && { image: found.image }),
      }
    })

  const services = rules.includedServices.rules
    .filter(
      (rule) =>
        rule.needs.some((needId) => chosen.has(needId)) &&
        (!rule.businessTypes || rule.businessTypes.includes(answers.businessType)) &&
        !rule.exceptBusinessTypes?.includes(answers.businessType),
    )
    .map((rule) => rule.text)
  const badges = rules.badges.filter(
    (badge) =>
      badge.needs.every((needId) => chosen.has(needId)) &&
      (!badge.premises || badge.premises === answers.premises),
  )
  return {
    items,
    services: [...new Set([...services, ...rules.includedServices.always])],
    badges,
  }
}

/** Slugs of the products the rules propose for these answers (before checking they exist). */
export function proposedSlugs(rules: Wizard, answers: WizardAnswers): string[] {
  const slugs = answers.needs.flatMap((needId) => {
    const byType = rules.proposals[needId]
    const slug = byType?.[answers.businessType] ?? byType?.['*']
    return slug ? [slug] : []
  })
  return [...new Set(slugs)]
}

const answersShape = z.object({
  businessType: z.string(),
  salesPoints: z.string(),
  computers: z.string(),
  premises: z.string(),
  needs: z.array(z.string()).max(30),
  when: z.string().optional(),
})

/**
 * The answers sent by the browser, checked against the rules of this site — or `null`. Ids and
 * options come only from the rules, so nothing else reaches the inquiry.
 */
export function parseWizardAnswers(rules: Wizard, input: unknown): WizardAnswers | null {
  const parsed = answersShape.safeParse(input)
  if (!parsed.success) return null
  const { businessType, salesPoints, computers, premises, needs, when } = parsed.data
  const type = rules.businessTypes.find((item) => item.id === businessType)
  const needIds = new Set(rules.needs.map((need) => need.id))
  const valid =
    type !== undefined &&
    rules.scale.salesPoints.options.includes(salesPoints) &&
    rules.scale.computers.options.includes(computers) &&
    rules.scale.premises.options.some((option) => option.id === premises) &&
    needs.every((needId) => needIds.has(needId)) &&
    new Set(needs).size === needs.length &&
    (when === undefined || rules.scale.when.some((option) => option.name === when))
  if (!valid) return null
  return {
    businessType: type.id,
    salesPoints,
    computers,
    premises,
    needs,
    ...(when !== undefined && { when }),
  }
}

/**
 * The answers and the kit as „pytanie: odpowiedź” for the e-mail and the panel (the inquiry's
 * `wizard` field) — readable without the rules at hand. „Na kiedy?” goes to `deadline`.
 */
export function wizardSummary(
  rules: Wizard,
  answers: WizardAnswers,
  kit: Kit,
): Record<string, string | string[]> {
  const nameOf = <T extends { id: string; name: string }>(list: T[], value: string) =>
    list.find((item) => item.id === value)?.name ?? value
  return {
    'Rodzaj firmy': nameOf(rules.businessTypes, answers.businessType),
    'Stanowiska sprzedaży': answers.salesPoints,
    Komputery: answers.computers,
    Lokal: nameOf(rules.scale.premises.options, answers.premises),
    Zestaw: kit.items.map((item) =>
      item.quantity > 1 ? `${item.quantity} × ${item.name}` : item.name,
    ),
    'W cenie': kit.services,
  }
}
