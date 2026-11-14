import type { HubPlanView } from '@/lib/prokom/data'
import { type BusinessLine, type HubForBusiness, stepsWithPromise } from '@/lib/prokom/forBusiness'
import type { IconName } from '@/lib/shared/icons'

import type { HomeLine } from '../home/model'

/** What a card of a line on `/dla-firm` shows: contact from the panel. */
export type BusinessLineInfo = Pick<
  HomeLine,
  'key' | 'name' | 'label' | 'domain' | 'url' | 'phone' | 'tel' | 'promise'
>

/** Icons of the industries (board 03 `BIC`, mapped to the shared set). */
const INDUSTRY_ICONS: Record<string, IconName> = {
  gastro: 'food',
  hotel: 'bed',
  sklep: 'store',
  biuro: 'brief',
  budowa: 'building',
  teren: 'car',
  gabinet: 'heart',
  produkcja: 'gear',
  deweloper: 'building',
  wspolnota: 'home',
  szkola: 'grad',
  gmina: 'building',
}

export type Industry = {
  key: string
  name: string
  sub: string | null
  icon: IconName
  title: string
  groups: (BusinessLineInfo & { points: string[] })[]
  start: string[]
  questions: string[]
}

/** Industries of „Wybierz branżę” — `HubPlans` of type `branza`, only lines on the page. */
export function industries(
  plans: readonly HubPlanView[],
  subs: HubForBusiness['industries']['subs'],
  lines: readonly BusinessLineInfo[],
): Industry[] {
  return plans
    .filter((plan) => plan.type === 'branza')
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
          sub: subs.find((entry) => entry.plan === plan.key)?.sub ?? null,
          icon: INDUSTRY_ICONS[plan.key] ?? 'spark',
          title: plan.title ?? plan.name,
          groups,
          start: plan.start,
          questions: plan.questions,
        },
      ]
    })
}

export type Area = Omit<HubForBusiness['areas']['items'][number], 'href'> & {
  line: BusinessLine
  /** The area's own hub page, else the line's site. */
  href: string | null
  info: BusinessLineInfo
}

/** Areas of lines on the page, the promise filled into their steps (spec §3). */
export function areas(
  items: HubForBusiness['areas']['items'],
  lines: readonly BusinessLineInfo[],
): Area[] {
  return items.flatMap((item) => {
    const info = lines.find((line) => line.key === item.line)
    if (!info) return []
    return [
      {
        ...item,
        href: item.href ?? info.url,
        steps: stepsWithPromise(item.steps, info.promise),
        info,
      },
    ]
  })
}

/** Situations whose every step is a line on the page (a missing line would break the order). */
export function situations(
  items: HubForBusiness['situations']['items'],
  lines: readonly BusinessLineInfo[],
): (HubForBusiness['situations']['items'][number] & {
  steps: (BusinessLineInfo & { what: string })[]
})[] {
  return items.flatMap((item) => {
    const steps = item.order.flatMap((step) => {
      const line = lines.find((entry) => entry.key === step.line)
      return line ? [{ ...line, what: step.what }] : []
    })
    return steps.length === item.order.length ? [{ ...item, steps }] : []
  })
}
