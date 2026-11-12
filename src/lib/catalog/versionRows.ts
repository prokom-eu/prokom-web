import { modelValues } from './bento'

/** A row of the version table: a parameter and its value per version (`null` — not given). */
export type VersionRow = { label: string; values: (string | null)[] }

const norm = (text: string) => text.toLocaleLowerCase('pl').replace(/\s+/g, ' ').trim()

/**
 * „Czym różnią się wersje” as a table (PRODUKCJA-BIZNES-1211 §1): parameters written per model
 * („TASKalfa 2320: 23 str./min; TASKalfa 2020: 20 str./min”) become rows, one column per
 * version (matched by the model's name inside the version's name, either way round). Only rows
 * whose values differ, and only when every model of the row is a version of the card — anything
 * unsure stays in the parameters and the cards.
 */
export function versionRows(
  versions: readonly string[],
  specs: readonly { label: string; value: string }[],
): VersionRow[] {
  if (versions.length < 2) return []
  const names = versions.map(norm)
  const rows: VersionRow[] = []
  for (const spec of specs) {
    const parts = spec.value
      .split(';')
      .map((part) => part.trim())
      .filter(Boolean)
    if (!modelValues(spec.value)) continue
    const values: (string | null)[] = versions.map(() => null)
    let matched = true
    for (const part of parts) {
      const colon = part.indexOf(': ')
      const model = norm(part.slice(0, colon))
      const at = names.findIndex((name) => name.includes(model) || model.includes(name))
      if (at < 0 || values[at] !== null) {
        matched = false
        break
      }
      values[at] = part.slice(colon + 2).trim()
    }
    const given = values.filter((value): value is string => value !== null)
    if (matched && given.length >= 2 && new Set(given.map(norm)).size > 1)
      rows.push({ label: spec.label, values })
  }
  return rows
}
