/**
 * Fixed option lists of the Software line (ADR-014). They are database enums, so a new value
 * needs a migration — fine for lists that change with the design, not with the content.
 */

/** Catalog filter and price list tabs (`rozwiazania.json` → `category`). */
export const SOLUTION_CATEGORIES = [
  { label: 'Strony', value: 'strony' },
  { label: 'Systemy', value: 'systemy' },
  { label: 'Aplikacje', value: 'aplikacje' },
  { label: 'Automatyzacje', value: 'automatyzacje' },
  { label: 'Opieka i audyt', value: 'opieka' },
] as const

export type SolutionCategory = (typeof SOLUTION_CATEGORIES)[number]['value']

/** Situation filter of the catalog (`rozwiazania.json` → `situations`). */
export const SITUATIONS = [
  { label: 'Zaczynam od zera', value: 'Z' },
  { label: 'Mam program, brakuje mu czegoś', value: 'R' },
  { label: 'Mam kilka programów', value: 'P' },
] as const

/** Industry groups of the catalog filter (`branze.json` → `groups`). */
export const INDUSTRY_GROUPS = [
  { label: 'Budowlanka i ekipy', value: 'budowlanka-i-ekipy' },
  { label: 'Noclegi', value: 'noclegi' },
  { label: 'Turystyka i wydarzenia', value: 'turystyka-i-wydarzenia' },
  { label: 'Gastronomia', value: 'gastronomia' },
  { label: 'Zdrowie i uroda', value: 'zdrowie-i-uroda' },
  { label: 'Usługi i transport', value: 'uslugi-i-transport' },
  { label: 'Handel i producenci', value: 'handel-i-producenci' },
  { label: 'Edukacja i organizacje', value: 'edukacja-i-organizacje' },
] as const

/**
 * The 8 areas of the start page (`obszary.json` → `key`). The key also picks the tile gradient
 * (`--grad-area-<key>` in `tokens.css`, ADR-015 rozstrz. 4) and the illustration scene.
 */
export const AREA_KEYS = [
  { label: 'Strony internetowe', value: 'www' },
  { label: 'Systemy', value: 'sys' },
  { label: 'Aplikacje', value: 'app' },
  { label: 'Sklepy i rezerwacje', value: 'cal' },
  { label: 'Rozbudowa i połączenia', value: 'plug' },
  { label: 'Automatyzacje', value: 'auto' },
  { label: 'Opieka', value: 'care' },
  { label: 'Audyt', value: 'aud' },
] as const

/**
 * Thumbnail gradients of solution cards (ADR-015 rozstrz. 4) — keys only; the colours become
 * `--grad-card-<key>` tokens with the card itself (SW9). Empty = the card has no thumbnail.
 */
export const CARD_GRADIENTS = [
  { label: 'Brzoskwiniowy', value: 'peach' },
  { label: 'Piaskowy', value: 'sand' },
  { label: 'Szałwiowy', value: 'sage' },
] as const

/** Sizes of a solution in the wizard (`kreator.json` → `sizes`): one price and term each. */
export const SOLUTION_SIZES = ['start', 'std', 'full'] as const

export type SolutionSize = (typeof SOLUTION_SIZES)[number]
