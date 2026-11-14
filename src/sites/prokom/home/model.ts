import type { HubPlanView, HubToolView } from '@/lib/prokom/data'
import { fillPromise, type HubHome, withVisibleFacts } from '@/lib/prokom/home'
import type { HubLineContact } from '@/lib/prokom/lineContacts'
import type { HubLine } from '@/lib/prokom/lines'
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
