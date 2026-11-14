/*
 * Content waiting for the boss carries a marker (`[SZEF…]`, `[CENA…]`). In a collection with drafts
 * such a record may be saved, but not published — the rule of `InstArchNews` (ADR-I005 §2), here
 * for any collection and any list of visible fields (hub: ADR-H002 „Zasada”).
 */

type Row = Record<string, unknown>
type Status = 'draft' | 'published' | null | undefined

const MARKER = /\[\s*(SZEF|CENA)/i

function texts(value: unknown): string[] {
  if (typeof value === 'string') return [value]
  if (Array.isArray(value)) return value.flatMap(texts)
  if (value && typeof value === 'object') {
    return Object.entries(value as Row)
      .filter(([key]) => key !== 'id')
      .flatMap(([, v]) => texts(v))
  }
  return []
}

/**
 * The first of `fields` with a marker that stops this save from publishing, or `null`. A partial
 * update (no status, only some fields) is checked together with the stored document.
 */
export function blockedByMarker<F extends string>(
  fields: readonly F[],
  data: Row & { _status?: Status },
  stored?: (Row & { _status?: Status }) | null,
): F | null {
  if ((data._status ?? stored?._status) !== 'published') return null
  const merged: Row = { ...stored, ...data }
  return fields.find((field) => texts(merged[field]).some((t) => MARKER.test(t))) ?? null
}
