import type { HubSetting } from '../../payload-types'

/**
 * HUB-R1 follow-up (Krystian 19.11.2026), frozen for the data migration `hub_r1_poprawki`:
 * the Rabka point is confirmed (alsen.pl/sklepy lists PRO-KOM, ul. Orkana 16B) and the
 * Instalacje home rail gets „Sprzęt” (INST-K2). The figure and `sklep@pro-kom.eu` — `hub_sklep_alsen`.
 */

type Trust = NonNullable<HubSetting['trust']>[number]

export const FACTS_APPROVED_1911 = ['ALSEN Rabka'] as const
export const INST_RAIL_SPRZET = { anchorId: 'sprzet', label: 'Sprzęt', icon: 'box' }

const approvedNow = new Set<string>(FACTS_APPROVED_1911)

/** Facts with „ALSEN Rabka” approved; `null` = nothing to change. */
export function trustWith1911(stored: readonly Trust[] | null | undefined): Trust[] | null {
  if (!stored?.some((row) => approvedNow.has(row.value) && row.approved !== true)) return null
  return stored.map((row) => (approvedNow.has(row.value) ? { ...row, approved: true } : row))
}

/** Instalacje home rail with „Sprzęt” after „Usługi” (only while missing); `null` = no change. */
export function instRailWith1911<T extends { anchorId?: string | null }>(
  sections: readonly T[] | null | undefined,
): (T | typeof INST_RAIL_SPRZET)[] | null {
  if (!sections?.length || sections.some((row) => row.anchorId === 'sprzet')) return null
  const at = sections.findIndex((row) => row.anchorId === 'uslugi')
  const index = at < 0 ? sections.length : at + 1
  return [...sections.slice(0, index), { ...INST_RAIL_SPRZET }, ...sections.slice(index)]
}
