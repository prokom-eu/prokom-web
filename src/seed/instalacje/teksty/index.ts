/**
 * Runda v6 §2 (INST-6): texts of the package (`seed/prokominstalacje/`, 1:1 from the prototype,
 * not edited) rewritten „po ludzku”. The seed maps every package file through `rewritten()` after
 * `withoutLaw()`: an exact text (after the law clean-up) → its new wording. One module per page
 * group; `pnpm inst:texts` carries the result to the panels of staging and production.
 */
import { OBIEKTY_MODULES } from './obiekty'
import { USLUGI_MODULES } from './uslugi'

/** Every dictionary of INST-6 by name; a text may sit in one of them only (test). */
export const TEXT_MODULES: Readonly<Record<string, Readonly<Record<string, string>>>> = {
  ...USLUGI_MODULES,
  ...OBIEKTY_MODULES,
}

export const TEXT_REWRITES: Readonly<Record<string, string>> = Object.assign(
  {},
  ...Object.values(TEXT_MODULES),
)

/** A deep copy with every listed text replaced by its new wording. */
export function rewritten<T>(value: T): T {
  if (typeof value === 'string') return (TEXT_REWRITES[value] ?? value) as T
  if (Array.isArray(value)) return value.map(rewritten) as T
  if (typeof value === 'object' && value !== null)
    return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, rewritten(v)])) as T
  return value
}
