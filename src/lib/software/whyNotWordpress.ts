import type { SoftwareHome } from './home'
import type { Fill } from './process'

/** „Dlaczego nie WordPress i PHP” ready to render (spec. §4 pkt 8). */
export type WhyNotWordpressView = {
  eyebrow: string
  title: string
  lead: string | null
  /** Every fact with its source; the last one is ours („0 wtyczek”) and is highlighted. */
  facts: { value: string; text: string; source: string }[]
  /** Headings of the two compared columns: [theirs, ours]. */
  columns: [string, string]
  rows: { name: string; theirs: string; ours: string }[]
  cta: {
    title: string
    text: string | null
    /** The last button is the main one. */
    buttons: { label: string; href: string; primary: boolean }[]
  } | null
  link: { label: string; href: string } | null
}

/**
 * Texts of the section with their facts and prices filled (`{cena:przebudowa-starej-strony}`).
 * On production a text with a missing value is left out, not shown with its token: a fact
 * without its source goes (the section promises sources), a row with a missing cell goes, the
 * rebuild button without its price goes. Without its heading the section is not rendered.
 */
export function whyNotWordpressView(
  data: SoftwareHome['whyNotWordpress'],
  fill: Fill,
): WhyNotWordpressView | null {
  const eyebrow = fill(data.eyebrow)
  const title = fill(data.title)
  if (!eyebrow || !title) return null

  const facts = data.facts.flatMap((fact) => {
    const value = fill(fact.v)
    const text = fill(fact.t)
    const source = fill(fact.src)
    return value && text && source ? [{ value, text, source }] : []
  })

  // The layout compares two columns, with the row names in the first one.
  const [, theirsColumn, oursColumn] = data.compare.columns.map((column) => fill(column))
  const table = data.compare.columns.length === 3 && theirsColumn && oursColumn
  const rows = table
    ? data.compare.rows.flatMap(([rowName = '', theirsCell = '', oursCell = '']) => {
        const name = fill(rowName)
        const theirs = fill(theirsCell)
        const ours = fill(oursCell)
        return name && theirs && ours ? [{ name, theirs, ours }] : []
      })
    : []

  return {
    eyebrow,
    title,
    lead: fill(data.lead),
    facts,
    columns: [theirsColumn ?? '', oursColumn ?? ''],
    rows,
    cta: ctaView(data.cta, fill),
    link: linkView(data.cta.link, fill),
  }
}

function ctaView(
  cta: SoftwareHome['whyNotWordpress']['cta'],
  fill: Fill,
): WhyNotWordpressView['cta'] {
  const title = fill(cta.title)
  if (!title) return null
  const buttons = cta.buttons.flatMap(([text, href]) => {
    const label = fill(text)
    return label ? [{ label, href }] : []
  })
  return {
    title,
    text: fill(cta.text),
    buttons: buttons.map((button, index) => ({
      ...button,
      primary: index === buttons.length - 1,
    })),
  }
}

function linkView([text, href]: readonly [string, string], fill: Fill) {
  const label = fill(text)
  return label ? { label, href } : null
}
