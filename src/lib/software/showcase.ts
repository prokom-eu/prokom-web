import type { SoftwareHome } from './home'
import type { Fill } from './process'

/** „Realizacje” ready to render (spec. §4 pkt 10). */
export type ShowcaseView = {
  eyebrow: string
  title: string
  lead: string | null
  /** Own systems of PRO-KOM; `live` — working (green dot), else under construction. */
  items: { name: string; status: string; text: string; url: string; live: boolean }[]
  stats: { value: string; label: string }[]
}

/**
 * Texts of the section with their facts filled. On production a figure without its value
 * (`[WYNIK]` — measured Lighthouse score, not promised) is left out, not shown with its token;
 * without its heading the section is not rendered.
 */
export function showcaseView(
  data: SoftwareHome['showcase'],
  eyebrowText: string,
  fill: Fill,
): ShowcaseView | null {
  const eyebrow = fill(eyebrowText)
  const title = fill(data.title)
  if (!eyebrow || !title) return null

  const items = data.items.flatMap((item) => {
    const name = fill(item.name)
    const status = fill(item.status)
    const text = fill(item.text)
    if (!name || !status || !text) return []
    return [{ name, status, text, url: item.url, live: status.trim().toLowerCase() === 'działa' }]
  })

  const stats = data.stats.flatMap((stat) => {
    const value = fill(stat.v)
    const label = fill(stat.l)
    return value && label ? [{ value, label }] : []
  })

  return { eyebrow, title, lead: fill(data.lead), items, stats }
}
