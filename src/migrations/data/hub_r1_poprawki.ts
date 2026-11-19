import type { HubSetting } from '../../payload-types'

/**
 * HUB-R1 follow-up (Krystian 19.11.2026), frozen for the data migration `hub_r1_poprawki`:
 * the ALSEN figure and the Rabka point are confirmed (alsen.pl/sklepy lists 400 shops, among
 * them PRO-KOM, ul. Orkana 16B), the working „Zamówienia” mailbox is `sklep@pro-kom.eu`
 * (`sklep@pro-kom.pl` does not work), and the Instalacje home rail gets „Sprzęt” (INST-K2).
 */

type Trust = NonNullable<HubSetting['trust']>[number]
type ExtraEmail = NonNullable<HubSetting['extraEmails']>[number]

export const FACTS_APPROVED_1911 = ['ALSEN 350+', 'ALSEN Rabka'] as const
export const SHOP_EMAIL_OLD = 'sklep@pro-kom.pl'
export const SHOP_EMAIL_1911 = { label: 'Zamówienia', email: 'sklep@pro-kom.eu', published: true }
export const INST_RAIL_SPRZET = { anchorId: 'sprzet', label: 'Sprzęt', icon: 'box' }

const approvedNow = new Set<string>(FACTS_APPROVED_1911)

/** Facts with the two ALSEN facts approved; `null` = nothing to change. */
export function trustWith1911(stored: readonly Trust[] | null | undefined): Trust[] | null {
  if (!stored?.some((row) => approvedNow.has(row.value) && row.approved !== true)) return null
  return stored.map((row) => (approvedNow.has(row.value) ? { ...row, approved: true } : row))
}

/**
 * Old e-mails with `sklep@pro-kom.pl` replaced by the working `sklep@pro-kom.eu`, shown (its
 * label edited in the panel stays); added when neither is stored. `null` = nothing to change.
 */
export function extraEmailsWith1911(
  stored: readonly ExtraEmail[] | null | undefined,
): ExtraEmail[] | null {
  const rows = stored ?? []
  if (rows.some((row) => row.email === SHOP_EMAIL_1911.email)) return null
  if (!rows.some((row) => row.email === SHOP_EMAIL_OLD)) return [...rows, { ...SHOP_EMAIL_1911 }]
  return rows.map((row) =>
    row.email === SHOP_EMAIL_OLD ? { ...row, email: SHOP_EMAIL_1911.email, published: true } : row,
  )
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
