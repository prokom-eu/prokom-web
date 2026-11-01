import { MAX_NOTE } from '../cart/cart'
import { optionHelp } from './configHelp'
import { variantKey, variantSlug, withoutBrackets } from './productName'

/**
 * Configurator 2.0 (K31-ZMIANY §13.7): the visitor picks a version before the inquiry. Not a
 * cart and never a price — the choice becomes the note of the inquiry item.
 */

/** Values longer than this make the option a list of full rows instead of chips. */
export const ROW_VALUE = 40

export type ConfigOption = {
  name: string
  values: string[]
  note: string | null
  help: string | null
  rows: boolean
}

export type Configurator = {
  description: string | null
  /** Options with ≥ 2 values — all of them, nothing hidden. */
  options: ConfigOption[]
  /** Options with one value: „W każdej wersji”. */
  standard: { name: string; value: string }[]
  presets: { name: string; configuration: string }[]
}

export const ADVISE = 'advise'

/** Per option (by index): a value, `ADVISE` („Doradźcie”) or nothing. */
export type Selection = Record<number, string>

export type ConfigState = { preset: number | null; selection: Selection }

export const EMPTY_STATE: ConfigState = { preset: null, selection: {} }

type RawConfigurator = {
  description?: string | null
  options?: { name: string; values?: string[] | null; note?: string | null }[] | null
  popular?: { name: string; configuration: string }[] | null
} | null

const clean = (values: readonly string[] | null | undefined) => [
  ...new Set((values ?? []).map((value) => value.trim()).filter(Boolean)),
]

/** The configurator of a card, or `null` when there is nothing to choose. */
export function buildConfigurator(raw: RawConfigurator | undefined): Configurator | null {
  const options: ConfigOption[] = []
  const standard: Configurator['standard'] = []
  for (const option of raw?.options ?? []) {
    const name = option.name.trim()
    const values = clean(option.values)
    if (!name || values.length === 0) continue
    if (values.length === 1) {
      standard.push({ name, value: values[0]! })
      continue
    }
    options.push({
      name,
      values,
      note: option.note?.trim() || null,
      help: optionHelp(name),
      rows: values.some((value) => value.length > ROW_VALUE),
    })
  }
  if (options.length === 0) return null
  const presets = (raw?.popular ?? [])
    .map(({ name, configuration }) => ({ name: name.trim(), configuration: configuration.trim() }))
    .filter((preset) => preset.name && preset.configuration)
  return { description: raw?.description?.trim() || null, options, standard, presets }
}

const norm = (text: string) => text.toLowerCase().replace(/\s+/g, ' ').trim()

/** Head of a long value: „G9 IRL — Intel Core 3 100U / …” → „G9 IRL”. */
const valueHead = (value: string) => value.split(/ — | – | - /)[0]!.trim()

/** Whether `phrase` stands in `text` as a whole (not inside a longer number or word). */
function containsPhrase(text: string, phrase: string): boolean {
  if (!phrase) return false
  let from = 0
  for (;;) {
    const at = text.indexOf(phrase, from)
    if (at < 0) return false
    const before = text[at - 1]
    const after = text[at + phrase.length]
    const edge = (char: string | undefined) => !char || !/[\p{L}\p{N}]/u.test(char)
    if (edge(before) && edge(after)) return true
    from = at + 1
  }
}

/**
 * Values a ready configuration fills in (K31-ZMIANY §13.7): per option the longest value whose
 * text (or head before „ — ”) stands in the configuration's description.
 */
export function presetSelection(
  options: readonly ConfigOption[],
  configuration: string,
): Selection {
  const text = norm(configuration)
  const selection: Selection = {}
  options.forEach((option, index) => {
    const match = option.values
      .filter(
        (value) =>
          containsPhrase(text, norm(value)) || containsPhrase(text, norm(valueHead(value))),
      )
      .sort((a, b) => b.length - a.length)[0]
    if (match) selection[index] = match
  })
  return selection
}

/** Click on a ready configuration: fills its options; a second click clears the choice. */
export function togglePreset(
  config: Configurator,
  state: ConfigState,
  preset: number,
): ConfigState {
  if (state.preset === preset) return EMPTY_STATE
  const chosen = config.presets[preset]
  if (!chosen) return state
  return { preset, selection: presetSelection(config.options, chosen.configuration) }
}

/** Click on a value or „Doradźcie”: picks it, or clears the option when picked already. */
export function toggleValue(state: ConfigState, option: number, value: string): ConfigState {
  const selection = { ...state.selection }
  if (selection[option] === value) delete selection[option]
  else selection[option] = value
  return { ...state, selection }
}

/**
 * `?wersja=<model>` (K31-ZMIANY §13.5): the version of a card with many models picks the value
 * of the option that names the models („G8 IRL — Intel Core 3 …”).
 */
export function versionSelection(
  config: Configurator,
  variants: readonly string[],
  slug: string | null,
): ConfigState {
  if (!slug) return EMPTY_STATE
  const variant = variants.find((name) => variantSlug(name) === slug)
  if (!variant) return EMPTY_STATE
  const key = norm(variantKey(variant))
  // „X9 14 Gen 1 Aura Edition” ↔ „X9 14 Gen 1 (14")”: one name starts the other, at a word edge.
  const sameModel = (head: string) =>
    head === key || key.startsWith(`${head} `) || head.startsWith(`${key} `)
  for (const [index, option] of config.options.entries()) {
    const value = option.values.find(
      (item) =>
        sameModel(norm(withoutBrackets(valueHead(item)))) || containsPhrase(norm(item), key),
    )
    if (value) return { preset: null, selection: { [index]: value } }
  }
  return EMPTY_STATE
}

/** Chosen values (not „Doradźcie”) in the order of the options. */
export function chosenValues(config: Configurator, state: ConfigState) {
  return config.options.flatMap((option, index) => {
    const value = state.selection[index]
    return value && value !== ADVISE ? [{ name: option.name, value }] : []
  })
}

/**
 * Note of the inquiry item (K31-ZMIANY §13.7): „Wersja: Biuro · Procesor: … · Ekran:
 * doradźcie”. Untouched options stay out; nothing chosen → empty.
 */
export function configNote(config: Configurator, state: ConfigState): string {
  const parts: string[] = []
  const preset = state.preset === null ? null : config.presets[state.preset]
  if (preset) parts.push(`Wersja: ${preset.name}`)
  config.options.forEach((option, index) => {
    const value = state.selection[index]
    if (value) parts.push(`${option.name}: ${value === ADVISE ? 'doradźcie' : value}`)
  })
  return parts.join(' · ')
}

/**
 * The note with the chosen colour first (K32 §9): „Kolor: burgund · Wersja: …”. A „Kolor”
 * option of the configurator gives way to it — one colour per item.
 */
export function colorNote(color: string | null, note: string): string {
  if (!color) return note
  const rest = note.split(' · ').filter((part) => part && !/^Kolor:/i.test(part))
  return [`Kolor: ${color}`, ...rest].join(' · ')
}

export type AddAction = 'add' | 'update' | 'remove'

/** A note as the inquiry list keeps it (`setNote`: trimmed, at most `MAX_NOTE`). */
const storedNote = (note: string) => note.trim().slice(0, MAX_NOTE)

/**
 * What „Dodaj do zapytania” does on the product page: adds the product with the chosen version;
 * on the list already — saves a changed version, else takes the product off the list. Without a
 * choice (e.g. after a reload) it never overwrites the version saved before.
 */
export function addAction(inCart: boolean, savedNote: string, note: string): AddAction {
  if (!inCart) return 'add'
  const next = storedNote(note)
  if (!next || next === storedNote(savedNote)) return 'remove'
  return 'update'
}
