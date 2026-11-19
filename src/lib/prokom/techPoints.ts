import { toTelHref } from '../site/link'
import type { HubBranch } from './data'
import { hubPhone } from './phone'

/**
 * Name of the general Tech number next to the points (runda 1811 D5).
 * TODO(krystian): the boss's decision — „Infolinia” (recommended) / „Numer ogólny” / „Centrala”.
 */
export const INFOLINE_LABEL = 'Infolinia'

export type TechPoint = { label: string; phone: string; tel: string }

type Source = {
  extraPhones: readonly { number: string; techPoint?: string | null }[]
  branch: HubBranch | null
}

/**
 * Phones of the Tech points shown wherever the hub gives Tech's contact (runda 1811 D5, the boss:
 * „w TECH brakuje telefonów”): the landlines marked as a Tech point in `HubSettings.extraPhones`
 * (Rabka-Zdrój), the Zakopane branch (Tech only, decision 15.11), then the line's own number from
 * `CompanyData.lines` as the infoline. Nothing in code — no point number = `[]`, and the line keeps
 * its single phone. A number given twice shows once (the first label wins).
 */
export function techPoints({ extraPhones, branch }: Source, linePhone: string | null): TechPoint[] {
  const rows = [
    ...extraPhones.flatMap((row) =>
      row.techPoint?.trim() ? [{ label: row.techPoint.trim(), phone: row.number }] : [],
    ),
    ...(branch?.phone ? [{ label: branch.city, phone: branch.phone }] : []),
  ]
  if (!rows.length) return []
  const seen = new Set<string>()
  return [...rows, ...(linePhone ? [{ label: INFOLINE_LABEL, phone: linePhone }] : [])].flatMap(
    ({ label, phone }) => {
      const shown = hubPhone(phone)
      const tel = shown ? toTelHref(shown) : null
      if (!shown || !tel || seen.has(tel)) return []
      seen.add(tel)
      return [{ label, phone: shown, tel }]
    },
  )
}
