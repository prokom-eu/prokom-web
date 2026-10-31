import type { SoftwareHome, SoftwareHomeSections } from './home'
import type { Fill } from './process'

/** The picture of a „Jak robimy” card — by its place (board `Main`: gauge, shield, search). */
export type HowWeBuildKind = 'speed' | 'safe' | 'search'

const KINDS: readonly HowWeBuildKind[] = ['speed', 'safe', 'search']

/** „Jak robimy” ready to render (spec. §4 pkt 8). */
export type HowWeBuildView = {
  eyebrow: string
  title: string
  lead: string | null
  gainLabel: string
  cards: { kind: HowWeBuildKind; badge?: string; name: string; text: string; gain: string }[]
  source: string | null
  /** „Nasz: [WYNIK]” — left out on production while the score is not measured. */
  result: string | null
}

/** Texts with their facts filled; without its heading the section is not rendered. */
export function howWeBuildView(
  texts: NonNullable<SoftwareHomeSections['howWeBuild']>,
  fill: Fill,
): HowWeBuildView | null {
  const eyebrow = fill(texts.eyebrow)
  const title = fill(texts.title)
  if (!eyebrow || !title) return null
  const cards = texts.cards.flatMap((card, index) => {
    const name = fill(card.name)
    const text = fill(card.text)
    const gain = fill(card.gain)
    const badge = card.badge ? (fill(card.badge) ?? undefined) : undefined
    const kind = KINDS[index]
    if (!name || !text || !gain || !kind) return []
    return [{ kind, badge, name, text, gain }]
  })
  return {
    eyebrow,
    title,
    lead: fill(texts.lead),
    gainLabel: fill(texts.gainLabel) ?? texts.gainLabel,
    cards,
    source: fill(texts.source),
    result: fill(texts.result),
  }
}

export type TechnologyLayer = {
  name: string
  /** What the layer is for the customer („To, co widzi Twój klient”). */
  subtitle: string
  tools: string[]
  icon: string
  gain: string
  why: string | null
  figures: { value: string; label: string }[]
  proof: string | null
}

/** „Z czego budujemy” ready to render (spec. §4 pkt 10). */
export type TechnologiesView = {
  eyebrow: string
  title: string
  lead: string | null
  tabsLabel: string
  gainLabel: string
  whyLabel: string
  layers: TechnologyLayer[]
}

/**
 * Headings and the layers of `technologies` with their facts filled. On production a figure
 * without its value (`[WYNIK]`) is left out, the layer stays; a layer without its gain is dropped.
 */
export function technologiesView(
  texts: NonNullable<SoftwareHomeSections['technologies']>,
  layers: SoftwareHome['technologies'],
  fill: Fill,
): TechnologiesView | null {
  const eyebrow = fill(texts.eyebrow)
  const title = fill(texts.title)
  if (!eyebrow || !title) return null
  const items = layers.flatMap((layer): TechnologyLayer[] => {
    const name = fill(layer.n)
    const subtitle = fill(layer.s)
    const gain = fill(layer.gain)
    if (!name || !subtitle || !gain) return []
    const figures = layer.m.flatMap((figure) => {
      const value = fill(figure.v)
      const label = fill(figure.l)
      return value && label ? [{ value, label }] : []
    })
    return [
      {
        name,
        subtitle,
        tools: layer.t,
        icon: layer.ic,
        gain,
        why: fill(layer.why),
        figures,
        proof: fill(layer.proof),
      },
    ]
  })
  if (items.length === 0) return null
  return {
    eyebrow,
    title,
    lead: fill(texts.lead),
    tabsLabel: texts.tabsLabel,
    gainLabel: texts.gainLabel,
    whyLabel: texts.whyLabel,
    layers: items,
  }
}
