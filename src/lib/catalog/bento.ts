import { paramIcon, type ProductIcon } from './productIcons'

type Row = { label: string; value: string }

export type BentoTile = { label: string; value: string; icon: ProductIcon }

/** Parameters the „W skrócie” tiles prefer, in this order (K31-ZMIANY §4 pkt 3). */
const PRIORITY = [
  'ekran',
  'procesor',
  'pamięć ram',
  'dysk',
  'karta graficzna',
  'porty',
  'łączność',
  'bateria',
  'waga',
  'bezpieczeństwo',
]

/** Length of a tile value; the first (dark, double height) tile takes a bit more. */
export const TILE_MAX = 60
export const FIRST_TILE_MAX = 70

/** Places where a long value may end without „…”: before these, never in the middle. */
const BREAKS = [', ', ' (', ' — ', ' / ']

/** Drops an unclosed bracket and what follows it („Intel (seria 1” → „Intel”). */
function closeBrackets(text: string): string {
  let out = text
  while ((out.match(/\(/g) ?? []).length > (out.match(/\)/g) ?? []).length) {
    out = out.slice(0, out.lastIndexOf('('))
  }
  return out.replace(/[\s,;:—/-]+$/, '').trim()
}

/**
 * A parameter value fit for a tile (K31-ZMIANY §4 pkt 3): the first part up to „;”, at most
 * `max` characters, cut at the last „, ” / „ (” / „ — ” / „ / ” without an ellipsis; „…” only
 * when the cut falls inside a phrase. An unclosed bracket is removed.
 */
export function shortenValue(value: string, max = TILE_MAX): string {
  const first = value.split(';')[0]!.trim()
  if (first.length <= max) return closeBrackets(first)
  const head = first.slice(0, max + 1)
  const cut = Math.max(...BREAKS.map((mark) => head.lastIndexOf(mark)))
  if (cut > 0) return closeBrackets(first.slice(0, cut))
  const space = head.lastIndexOf(' ')
  return `${closeBrackets(first.slice(0, space > 0 ? space : max))}…`
}

const norm = (label: string) => label.trim().toLowerCase()

/**
 * The „W skrócie” bento (K31-ZMIANY §4 pkt 3): parameters of the priority list first (a name
 * starting with it counts: „Pamięć RAM (stan/max)”), then the rest in order — 5 tiles, or 3
 * when there are 3–4 parameters (no orphan tile); none below 3.
 */
export function bentoTiles(specs: readonly Row[]): BentoTile[] {
  const rows = specs.filter((row) => row.label.trim() && row.value.trim())
  const chosen: Row[] = []
  for (const key of PRIORITY) {
    const row = rows.find((item) => !chosen.includes(item) && norm(item.label).startsWith(key))
    if (row) chosen.push(row)
  }
  for (const row of rows) if (!chosen.includes(row)) chosen.push(row)
  const count = chosen.length >= 5 ? 5 : chosen.length >= 3 ? 3 : 0
  return chosen.slice(0, count).map((row, position) => ({
    label: row.label.trim(),
    value: shortenValue(row.value, position === 0 ? FIRST_TILE_MAX : TILE_MAX),
    icon: paramIcon(row.label),
  }))
}
