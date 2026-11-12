import { modelValues } from './bento'

/** A row of the version table: a parameter and its value per version (`null` — not given). */
export type VersionRow = { label: string; values: (string | null)[] }

const norm = (text: string) => text.toLocaleLowerCase('pl').replace(/\s+/g, ' ').trim()

const escape = (text: string) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

/**
 * The version a model name belongs to: the same name, else the only version that has the model
 * as a whole word („VC-50” is not inside „PVC-50”); `-1` when none or several. A model naming
 * two versions („DT2x i DT200”, „A/B”) is never matched — the row stays in the parameters.
 */
function versionOf(names: readonly string[], model: string): number {
  if (/\s(i|oraz)\s|\//.test(model)) return -1
  const exact = names.indexOf(model)
  if (exact >= 0) return exact
  const word = new RegExp(`(^|[^\\p{L}\\p{N}-])${escape(model)}($|[^\\p{L}\\p{N}-])`, 'u')
  const found = names.flatMap((name, i) => (word.test(name) ? [i] : []))
  return found.length === 1 ? found[0]! : -1
}

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
      const at = versionOf(names, model)
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
