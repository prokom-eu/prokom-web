/**
 * The realizations of the line on another database (production, staging) — the seed runs locally
 * only, so `/realizacje` and the home band were empty there (12.11.2026). Pure planning for
 * `inst-realizacje.ts`: what to create, which photos to upload, what is already there. A record
 * edited in the panel is never overwritten: only a missing realization is created, and photos are
 * given only to a realization whose photos are still empty (as the local seed does).
 */
export type PackageRealization = { legacyId: number; title: string } & Record<string, unknown>
export type PackagePhoto = { file: string; alt: string }
export type StoredRealization = {
  id: number | string
  legacyId?: number | null
  title?: string | null
  photos?: unknown[] | null
  year?: number | null
  _status?: string | null
}

export type RealizationStep =
  | { kind: 'create'; legacyId: number; title: string; photos: PackagePhoto[] }
  | {
      kind: 'photos'
      legacyId: number
      title: string
      id: StoredRealization['id']
      photos: PackagePhoto[]
      /** The year is still empty in the panel: the script fills it from the photos. */
      yearMissing: boolean
    }
  | { kind: 'skip'; legacyId: number; title: string; reason: string }

/** One step per package realization, in package order. */
export function planRealizations(
  wanted: readonly PackageRealization[],
  stored: readonly StoredRealization[],
  photos: ReadonlyMap<number, readonly PackagePhoto[]>,
): RealizationStep[] {
  const byLegacy = new Map(stored.flatMap((r) => (r.legacyId ? [[r.legacyId, r] as const] : [])))
  // A realization added by hand in the panel has no `legacyId`: the same title counts as it.
  const byTitle = new Map(stored.flatMap((r) => (r.title ? [[r.title.trim(), r] as const] : [])))
  return wanted.map((r) => {
    const own = [...(photos.get(r.legacyId) ?? [])]
    const found = byLegacy.get(r.legacyId) ?? byTitle.get(r.title.trim())
    if (!found) return { kind: 'create', legacyId: r.legacyId, title: r.title, photos: own }
    // A draft waiting in the panel: a write would publish it or take the page down — by hand.
    if (found._status !== 'published')
      return {
        kind: 'skip',
        legacyId: r.legacyId,
        title: r.title,
        reason: 'szkic w panelu — sprawdź ręcznie',
      }
    if (found.photos?.length)
      return { kind: 'skip', legacyId: r.legacyId, title: r.title, reason: 'jest, ze zdjęciami' }
    if (own.length === 0)
      return {
        kind: 'skip',
        legacyId: r.legacyId,
        title: r.title,
        reason: 'jest; w repo brak zdjęć',
      }
    return {
      kind: 'photos',
      legacyId: r.legacyId,
      title: r.title,
      id: found.id,
      photos: own,
      yearMissing: !found.year,
    }
  })
}

/** Markdown read before writing (and kept for the deployment notes). */
export function formatRealizationReport(steps: readonly RealizationStep[]): string {
  const create = steps.filter((s) => s.kind === 'create')
  const photos = steps.filter((s) => s.kind === 'photos')
  const files = [...create, ...photos].reduce((n, s) => n + s.photos.length, 0)
  const lines = [
    `Do utworzenia: ${create.length}, do uzupełnienia zdjęć: ${photos.length}, plików zdjęć: ${files}.`,
    '',
    '| # | Realizacja | Krok | Zdjęcia |',
    '|---|---|---|---|',
    ...steps.map((s) => {
      const step =
        s.kind === 'create'
          ? 'utworzyć'
          : s.kind === 'photos'
            ? 'dodać zdjęcia'
            : `bez zmian (${s.reason})`
      const count = s.kind === 'skip' ? '—' : String(s.photos.length)
      return `| ${s.legacyId} | ${s.title.replaceAll('|', '\\|')} | ${step} | ${count} |`
    }),
  ]
  return `${lines.join('\n')}\n`
}

/** Realizations of the panel that no package one matched (added by hand, or a changed title). */
export function unmatchedRealizations(
  wanted: readonly PackageRealization[],
  stored: readonly StoredRealization[],
): StoredRealization[] {
  const ids = new Set(wanted.map((r) => r.legacyId))
  const titles = new Set(wanted.map((r) => r.title.trim()))
  return stored.filter(
    (r) => !(r.legacyId && ids.has(r.legacyId)) && !(r.title && titles.has(r.title.trim())),
  )
}
