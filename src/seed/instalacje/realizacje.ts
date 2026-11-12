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
    if (found.photos?.length)
      return { kind: 'skip', legacyId: r.legacyId, title: r.title, reason: 'jest, ze zdjęciami' }
    if (own.length === 0)
      return {
        kind: 'skip',
        legacyId: r.legacyId,
        title: r.title,
        reason: 'jest; w repo brak zdjęć',
      }
    return { kind: 'photos', legacyId: r.legacyId, title: r.title, id: found.id, photos: own }
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
