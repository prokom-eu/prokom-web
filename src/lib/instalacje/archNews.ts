/*
 * „Nowe rozwiązania” of the page for architects (`InstArchNews`, ADR-I005 §2): a card with a
 * boss's marker (`[SZEF…]`, `[CENA…]`) in a field shown on the page must not go public — the
 * same rule as the e2e check of every page (spec §10). The internal note may carry one.
 */

type Row = Record<string, unknown>
export type ArchNewsFields = {
  _status?: 'draft' | 'published' | null
  title?: string | null
  description?: string | null
  params?: { label?: string | null; value?: string | null }[] | null
  planItems?: { text?: string | null }[] | null
  examples?: string | null
  places?: { name?: string | null }[] | null
  internalNote?: string | null
}

/** Fields rendered on the page, in the order they are checked. */
export const VISIBLE_FIELDS = [
  'title',
  'description',
  'params',
  'planItems',
  'examples',
  'places',
] as const
type VisibleField = (typeof VISIBLE_FIELDS)[number]

const MARKER = /\[\s*(SZEF|CENA)/i

function texts(value: unknown): string[] {
  if (typeof value === 'string') return [value]
  if (Array.isArray(value)) {
    return value.flatMap((row) =>
      row && typeof row === 'object'
        ? Object.entries(row as Row)
            .filter(([key]) => key !== 'id')
            .flatMap(([, v]) => texts(v))
        : texts(row),
    )
  }
  return []
}

/** The first visible field with a marker, or `null`. */
export function markerIn(doc: ArchNewsFields): VisibleField | null {
  return VISIBLE_FIELDS.find((field) => texts(doc[field]).some((t) => MARKER.test(t))) ?? null
}

/**
 * The field that stops this save from publishing, or `null`. A partial update (no status, only
 * some fields) is checked together with the stored document.
 */
export function publishWithMarker(
  data: ArchNewsFields,
  stored?: ArchNewsFields | null,
): VisibleField | null {
  if ((data._status ?? stored?._status) !== 'published') return null
  const merged: ArchNewsFields = { ...stored }
  for (const field of VISIBLE_FIELDS) {
    if (data[field] !== undefined) Object.assign(merged, { [field]: data[field] })
  }
  return markerIn(merged)
}
