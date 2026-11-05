import { toTelHref } from '../../site/link'
import { normalizeText } from './normalize'

/**
 * Command palette of the search (spec §5.1 dodatek 5): the line's contact actions with their
 * key words. Data from the panel only; the dialog runs them (navigate, copy, switch theme).
 */
export type PaletteKind =
  'call' | 'call2' | 'copy' | 'mail' | 'route' | 'primary' | 'contact' | 'theme'

export type PaletteAction = {
  kind: PaletteKind
  label: string
  /** Short word on the empty state's button („tel”, „mail”, „trasa”, „motyw”). */
  short: string
  icon: string
  /** Link to open; `copy` and `theme` run in the dialog instead. */
  href?: string
  /** What `copy` puts on the clipboard. */
  value?: string
  /** Normalized key words that bring the action to the top of the results. */
  words: string[]
}

export type PaletteInput = {
  phone: string | null
  phone2?: string | null
  email: string | null
  mapsUrl: string | null
  /** The line's main action (`shared.tabBar.center`): Zapytanie / Zaplanuj / Kreator. */
  primary?: { label: string; href: string; icon?: string | null } | null
  contactHref?: string
  /** Lines with a dark theme get „Motyw jasny/ciemny”. */
  themes?: boolean
}

const words = (...list: string[]) => list.map(normalizeText)

/** The actions a line has, in a fixed order; an action without its data is left out. */
export function paletteActions(input: PaletteInput): PaletteAction[] {
  const actions: PaletteAction[] = []
  const tel = input.phone ? toTelHref(input.phone) : null
  const tel2 = input.phone2 ? toTelHref(input.phone2) : null
  if (input.phone && tel) {
    actions.push({
      kind: 'call',
      label: `Zadzwoń · ${input.phone}`,
      short: 'tel',
      icon: 'phone',
      href: tel,
      words: words('tel', 'telefon', 'dzwon', 'zadzwon', 'numer'),
    })
  }
  if (input.phone2 && tel2) {
    actions.push({
      kind: 'call2',
      label: `Zadzwoń · ${input.phone2}`,
      short: 'tel 2',
      icon: 'phone',
      href: tel2,
      words: words('tel', 'telefon', 'dzwon', 'zadzwon', 'numer', 'drugi'),
    })
  }
  if (input.phone) {
    actions.push({
      kind: 'copy',
      label: 'Skopiuj numer',
      short: 'kopiuj',
      icon: 'doc',
      value: input.phone,
      words: words('kopiuj', 'skopiuj', 'numer', 'tel', 'telefon'),
    })
  }
  if (input.email) {
    actions.push({
      kind: 'mail',
      label: `Napisz e-mail · ${input.email}`,
      short: 'mail',
      icon: 'mail',
      href: `mailto:${input.email}`,
      words: words('mail', 'e-mail', 'email', 'napisz', 'poczta'),
    })
  }
  if (input.mapsUrl) {
    actions.push({
      kind: 'route',
      label: 'Wyznacz trasę',
      short: 'trasa',
      icon: 'pin',
      href: input.mapsUrl,
      words: words('trasa', 'dojazd', 'mapa', 'jak dojechac', 'adres', 'gdzie'),
    })
  }
  if (input.primary) {
    actions.push({
      kind: 'primary',
      label: input.primary.label,
      short: input.primary.label.toLowerCase(),
      icon: input.primary.icon ?? 'arrow',
      href: input.primary.href,
      words: words(input.primary.label),
    })
  }
  actions.push({
    kind: 'contact',
    label: 'Kontakt',
    short: 'kontakt',
    icon: 'chat',
    href: input.contactHref ?? '/kontakt',
    words: words('kontakt', 'formularz', 'wiadomosc'),
  })
  if (input.themes) {
    actions.push({
      kind: 'theme',
      label: 'Motyw jasny / ciemny',
      short: 'motyw',
      icon: 'refresh',
      words: words('motyw', 'ciemny', 'jasny', 'tryb'),
    })
  }
  return actions
}

/**
 * Actions for a query: one whose key word starts with a token of the query (or the query starts
 * with a key word — „jak dojechac do was”), in the palette order. Nothing for an empty query.
 */
export function matchActions(actions: readonly PaletteAction[], query: string): PaletteAction[] {
  const q = normalizeText(query)
  if (!q) return []
  const tokens = q.split(/[^a-z0-9]+/).filter((token) => token.length >= 2)
  return actions.filter((action) =>
    action.words.some(
      (word) => q.startsWith(word) || tokens.some((token) => word.startsWith(token)),
    ),
  )
}
