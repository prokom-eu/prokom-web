import { AREA_PATH } from '@/lib/instalacje/area'

type Column = { heading: string; links: { label: string; href: string }[] }

export const AREA_FOOTER_LINK = { label: 'Obszar działania', href: AREA_PATH }

/**
 * The footer's way to the town pages (ADR-I006 §6): „Obszar działania” → `/obszar` at the end of
 * the panel's last column. Not a column of its own: a fourth one squeezes the columns to a word
 * per line between 900 and 1100 px. Without columns in the panel — a column with that link.
 */
export function withAreaLink(columns: readonly Column[]): Column[] {
  if (columns.length === 0) return [{ heading: 'Obszar działania', links: [AREA_FOOTER_LINK] }]
  const last = columns.at(-1)!
  if (last.links.some((link) => link.href === AREA_PATH)) return [...columns]
  return [...columns.slice(0, -1), { ...last, links: [...last.links, AREA_FOOTER_LINK] }]
}
