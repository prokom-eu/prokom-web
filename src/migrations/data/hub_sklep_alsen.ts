/**
 * Hub data 19.11.2026 (Krystian): the shop address in use has always been `sklep@pro-kom.eu`
 * (`sklep@pro-kom.pl` — nobody reads it, the domain has no MX), and the ALSEN figure is confirmed.
 */

const OLD_SHOP = 'sklep@pro-kom.pl'
const SHOP = 'sklep@pro-kom.eu'

type EmailRow = { id?: string | null; label: string; email: string; published?: boolean | null }
type TrustRow = { value: string; approved?: boolean | null } & Record<string, unknown>

/** Extra e-mails with the shop address on; `null` = no change (an existing pro-kom.eu row stays). */
export function emailsWithShop(rows: readonly EmailRow[] | null | undefined): EmailRow[] | null {
  const list = rows ?? []
  if (list.some((row) => row.email === SHOP)) return null
  if (list.some((row) => row.email === OLD_SHOP)) {
    return list.map((row) =>
      row.email === OLD_SHOP ? { ...row, email: SHOP, published: true } : row,
    )
  }
  return [...list, { label: 'Zamówienia', email: SHOP, published: true }]
}

/** Facts with „ALSEN 350+” approved; `null` = no change. */
export function trustWithAlsenFigure(
  rows: readonly TrustRow[] | null | undefined,
): TrustRow[] | null {
  const list = rows ?? []
  if (!list.some((row) => row.value === 'ALSEN 350+' && row.approved !== true)) return null
  return list.map((row) => (row.value === 'ALSEN 350+' ? { ...row, approved: true } : row))
}
