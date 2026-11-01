import { plural } from '../plural'
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
 * A value per model: „V3: 6,75"; V3 Mix i D3 Mini: 10,1"” → the values, or `null` when the
 * value is not of that form (every part „Model: wartość”, at least two parts). A model name has
 * no bracket or comma and ends with „: ” — so „16:10” or „(G8: 300 nitów)” is not one.
 */
export function modelValues(value: string): string[] | null {
  const parts = value
    .split(';')
    .map((part) => part.trim())
    .filter(Boolean)
  if (parts.length < 2) return null
  const values: string[] = []
  for (const part of parts) {
    const colon = part.indexOf(': ')
    const model = colon > 0 ? part.slice(0, colon) : ''
    if (!model || model.length > 40 || /[(),]/.test(model)) return null
    values.push(part.slice(colon + 2).trim())
  }
  return values.every(Boolean) ? values : null
}

/**
 * A value per model on a tile (K4-FINAL §4.4): every value („203 / 300 dpi”), or „zależnie od
 * modelu (N wersji)” when together they are longer than `max` — never the first model alone.
 */
function modelTile(values: string[], max: number): string {
  const distinct = [...new Set(values)]
  const joined = distinct.join(' / ')
  if (joined.length <= max) return joined
  const n = values.length
  return `zależnie od modelu (${n} ${plural(n, ['wersja', 'wersje', 'wersji'])})`
}

/**
 * A parameter value fit for a tile (K31-ZMIANY §4 pkt 3): a value per model as `modelTile`;
 * else the first part up to „;”, at most
 * `max` characters, cut at the last „, ” / „ (” / „ — ” / „ / ” without an ellipsis; „…” only
 * when the cut falls inside a phrase. An unclosed bracket is removed.
 */
export function shortenValue(value: string, max = TILE_MAX): string {
  const models = modelValues(value)
  if (models) return modelTile(models, max)
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
