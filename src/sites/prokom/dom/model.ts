import type { HubPlanView } from '@/lib/prokom/data'
import type { HubForHome } from '@/lib/prokom/forHome'
import { isHubLine } from '@/lib/prokom/lines'
import type { IconName } from '@/lib/shared/icons'

import type { TeamExample } from '../home/model'
import type { Area, BusinessLineInfo, Industry } from '../firmy/model'

/** Icons of the home situations (`HubPlans` keys of type `sytuacja-dom`). */
const SITUATION_ICONS: Record<string, IconName> = {
  'buduje-dom': 'building',
  remontuje: 'wrench',
  'mieszkam-i-chce-unowoczesnic': 'home',
  'cos-sie-zepsulo': 'wrench',
  'szukam-komputera-do-gier': 'gamepad',
  'kupuje-dla-dziecka': 'users',
  'mam-apartament-na-wynajem': 'key',
}

/**
 * Situations of „Powiedz, co się u Ciebie dzieje” — `HubPlans` of type `sytuacja-dom` in the shape
 * of the industry picker: the plan's lines on the page, its first steps and the line to call.
 */
export function homeSituations(
  plans: readonly HubPlanView[],
  lines: readonly BusinessLineInfo[],
): Industry[] {
  return plans
    .filter((plan) => plan.type === 'sytuacja-dom')
    .flatMap((plan) => {
      const groups = plan.groups.flatMap((group) => {
        const line = lines.find((entry) => entry.key === group.line)
        return line && group.points.length ? [{ ...line, points: group.points }] : []
      })
      if (!groups.length) return []
      return [
        {
          key: plan.key,
          name: plan.name,
          sub: null,
          icon: SITUATION_ICONS[plan.key] ?? 'home',
          title: plan.title ?? plan.name,
          lead: plan.lead,
          groups,
          start: plan.steps,
          questions: [],
          call: lines.find((line) => line.key === plan.call) ?? null,
        },
      ]
    })
}

/** The three lines of the home scene as area tabs; the CTA leads to the line's site. */
export function sceneAreas(
  items: HubForHome['scene']['items'],
  lines: readonly BusinessLineInfo[],
): Area[] {
  return items.flatMap((item) => {
    const info = lines.find((line) => line.key === item.line)
    if (!info) return []
    return [
      {
        line: item.line,
        title: item.title,
        lead: item.lead,
        cta: item.cta,
        href: info.url,
        steps: item.steps.map((title) => ({ title, text: '' })),
        services: item.services,
        info,
      },
    ]
  })
}

/** Examples of „Jeden dom. Kilka linii.” for the team picker, only cards of lines on the page. */
export function homeExamples(
  examples: HubForHome['together']['examples'],
  lines: readonly BusinessLineInfo[],
): TeamExample[] {
  return examples.flatMap((example) => {
    const cards = example.groups.flatMap((group) =>
      isHubLine(group.line) && lines.some((line) => line.key === group.line)
        ? [{ line: group.line, points: group.points }]
        : [],
    )
    return cards.length
      ? [
          {
            persona: example.key,
            tab: example.tab,
            node: example.node,
            title: example.title,
            cards,
          },
        ]
      : []
  })
}
