import type { HubHelpView, HubPlanView, HubToolView } from '@/lib/prokom/data'
import { type FaqTokens, fillPromise, type HubHome, withVisibleFacts } from '@/lib/prokom/home'
import type { HubLineContact } from '@/lib/prokom/lineContacts'
import type { HubLine } from '@/lib/prokom/lines'
import type { SharedCompany } from '@/lib/shared/project'
import { hoursSummary } from '@/lib/site/hoursSummary'
import { toTelHref } from '@/lib/site/link'

type SceneTexts = HubHome['lines']['scene'][HubLine]

/** Texts of a line's scene with the promise filled in and the unapproved facts left out. */
export type HomeScene = Omit<SceneTexts, 'facts' | 'steps'> & {
  facts: string[]
  steps: { title: string; text: string }[]
}

/** One line on the home page: its contact (panel), its texts (`home`) and its two tools. */
export type HomeLine = {
  key: HubLine
  name: string
  /** „BIZNES” under the PRO–KOM mark. */
  label: string
  domain: string | null
  url: string | null
  phone: string | null
  tel: string | null
  promise: string | null
  hero: HubHome['hero']['lines'][HubLine]
  scene: HomeScene
  tools: { title: string; url: string | null }[]
}

/**
 * Lines of the home page in the order of the panel (`CompanyData.lines` via `HubLineContact`); a
 * line switched off in `CompanyData` is left out — never a placeholder (the schema of `home`
 * requires the texts of every line).
 */
export function homeLines(
  contacts: readonly HubLineContact[],
  home: HubHome,
  tools: readonly HubToolView[],
  visibleFacts: readonly { value: string }[],
): HomeLine[] {
  return contacts.map((contact) => ({
    key: contact.key,
    name: contact.name,
    label: contact.name.toLocaleUpperCase('pl-PL'),
    domain: contact.domain,
    url: contact.url,
    phone: contact.phone,
    tel: contact.phone ? toTelHref(contact.phone) : null,
    promise: contact.promise,
    hero: home.hero.lines[contact.key],
    scene: sceneOf(home.lines.scene[contact.key], contact.promise, visibleFacts),
    tools: tools
      .filter((tool) => tool.line === contact.key && tool.featuredOnHome)
      .slice(0, 2)
      .map((tool) => ({ title: tool.title, url: tool.url ?? contact.url })),
  }))
}

/** A card of the „Razem” tab: one line of a persona's plan. */
export type TeamCard = { line: HubLine; points: string[] }

export type TeamExample = {
  persona: string
  tab: string
  node: string
  title: string
  cards: TeamCard[]
}

/** Examples of the „Razem” tab from the persona plans (`HubPlans`), only of lines on the page. */
export function teamExamples(
  examples: HubHome['team']['examples'],
  plans: readonly HubPlanView[],
  lines: readonly HubLine[],
): TeamExample[] {
  return examples.flatMap((example) => {
    const plan = plans.find((entry) => entry.type === 'persona' && entry.key === example.persona)
    if (!plan) return []
    const cards = plan.groups
      .filter((group) => lines.includes(group.line))
      .map((group) => ({ line: group.line, points: group.points }))
    return cards.length ? [{ ...example, title: plan.title ?? plan.name, cards }] : []
  })
}

/** `{obietnica}` from the panel; a step or fact without a promise there is left out (spec §3). */
function sceneOf(
  scene: SceneTexts,
  promise: string | null,
  visibleFacts: readonly { value: string }[],
): HomeScene {
  return {
    ...scene,
    facts: withVisibleFacts(scene.facts, visibleFacts).flatMap(
      (fact) => fillPromise(fact.text, promise) ?? [],
    ),
    steps: scene.steps.flatMap((step) => {
      const title = fillPromise(step.title, promise)
      return title ? [{ title, text: step.text }] : []
    }),
  }
}

/** Polish plural: `plural(3, ['marka', 'marki', 'marek'])` → „3 marki”. */
export function plural(count: number, [one, few, many]: readonly [string, string, string]): string {
  const tens = count % 100
  const ones = count % 10
  if (count === 1) return `1 ${one}`
  if (ones >= 2 && ones <= 4 && (tens < 12 || tens > 14)) return `${count} ${few}`
  return `${count} ${many}`
}

/** „1 linia”, „3 linie”, „5 linii” — the plan's line count. */
export const linesCount = (count: number) => plural(count, ['linia', 'linie', 'linii'])

/** What a card of a plan links to: the line's own site (from its panel). */
type LineLink = Pick<HomeLine, 'key' | 'label' | 'domain' | 'url'>

export type ChoosePlan = {
  persona: string
  name: string
  sub: string | null
  title: string
  groups: (LineLink & { points: string[] })[]
}

/**
 * Personas of „Dobierz” (spec §6.1 pkt 3) in the order of `home.choose`, each with its plan from
 * `HubPlans` limited to the lines on the page. A persona without a plan, or without any line on
 * the page, is left out.
 */
export function choosePlans(
  personas: HubHome['choose']['personas'],
  plans: readonly HubPlanView[],
  lines: readonly LineLink[],
): ChoosePlan[] {
  return personas.flatMap(({ persona, sub }) => {
    const plan = plans.find((entry) => entry.type === 'persona' && entry.key === persona)
    if (!plan) return []
    const groups = plan.groups.flatMap((group) => {
      const line = lines.find((entry) => entry.key === group.line)
      return line && group.points.length ? [{ ...line, points: group.points }] : []
    })
    if (!groups.length) return []
    return [{ persona, name: plan.name, sub: sub ?? null, title: plan.title ?? plan.name, groups }]
  })
}

export type HelpCase = {
  slug: string
  title: string
  steps: string[]
  line: Pick<HomeLine, 'key' | 'name' | 'domain' | 'url' | 'phone' | 'tel'>
}

/** Situations of „Co zrobić, gdy…” in the order of `home.help.slugs`, only of lines on the page. */
export function helpCases(
  slugs: readonly string[],
  help: readonly HubHelpView[],
  lines: readonly HomeLine[],
): HelpCase[] {
  return slugs.flatMap((slug) => {
    const entry = help.find((item) => item.slug === slug)
    const line = entry && lines.find((item) => item.key === entry.line)
    if (!entry || !line || !entry.steps.length) return []
    const { key, name, domain, url, phone, tel } = line
    return [
      {
        slug,
        title: entry.title,
        steps: entry.steps.slice(0, 3),
        line: { key, name, domain, url, phone, tel },
      },
    ]
  })
}

/** „ul. Orkana 16B, 34-700 Rabka-Zdrój” from the company's first location; `null` without one. */
export function addressLine(company: Pick<SharedCompany, 'address'>): string | null {
  const address = company.address
  return address ? `${address.street}, ${address.postalCode} ${address.city}` : null
}

/** Contact data the FAQ tokens stand for — always from the panel (spec §3). */
export function faqTokens(
  company: Pick<SharedCompany, 'address' | 'hours'>,
  phone: string | null,
): FaqTokens {
  return {
    telefon: phone ?? '',
    adres: addressLine(company) ?? '',
    godziny: hoursSummary(company.hours),
  }
}
