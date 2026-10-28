import type { SoftwareHome } from './home'
import type { Fill } from './process'

/** Previews that have a mock-up in code (board `Main`, `#podglady`). */
export const PREVIEW_KINDS = ['www', 'rez', 'sys', 'app', 'auto'] as const
export type PreviewKind = (typeof PREVIEW_KINDS)[number]

export type LivePreview = {
  kind: PreviewKind
  label: string
  /** SVG path of the tab icon. */
  icon: string
  tag: string | null
  title: string
  text: string | null
  href: string
  /** Floating notes of the mock-up (desktop): title and small line. */
  notes: { title: string; text: string | null }[]
  steps: { title: string; text: string | null }[]
  /**
   * „Twój projekt” entry of „Chcę takie u siebie” (board: `hero-<key>`, the label with a small
   * first letter — „automatyzacje i AI”, the short form stays).
   */
  project: { id: string; name: string }
}

/**
 * Tabs of „Podglądy na żywo” in the board's order (`PREVIEW_KINDS`) — not the order of the
 * keys: PostgreSQL stores the JSON as `jsonb`, which does not keep it. Only the kinds with a
 * mock-up, texts with their facts filled. A preview without its label or title is skipped; a
 * note or a step without its title goes, the rest of the preview stays.
 */
export function livePreviews(previews: SoftwareHome['livePreviews'], fill: Fill): LivePreview[] {
  return PREVIEW_KINDS.flatMap((key) => {
    const preview = previews[key]
    if (!preview) return []
    const label = fill(preview.label)
    const title = fill(preview.title)
    if (!label || !title) return []
    const pairs = (items: readonly (readonly [string, string])[]) =>
      items.flatMap(([head, small]) => {
        const filled = fill(head)
        return filled ? [{ title: filled, text: fill(small) }] : []
      })
    return [
      {
        kind: key,
        label,
        icon: preview.icon,
        tag: fill(preview.tag),
        title,
        text: fill(preview.text),
        href: preview.href,
        notes: pairs([
          [preview.a, preview.as],
          [preview.b, preview.bs],
        ]),
        steps: pairs(preview.steps),
        project: { id: `hero-${key}`, name: label.charAt(0).toLowerCase() + label.slice(1) },
      },
    ]
  })
}
