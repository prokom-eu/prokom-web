import { hasSameValues } from '../compare'

/**
 * Runda v6 D4: the texts of the Instalacje pages that live in the panel, carried to staging and
 * production by `inst-texts.ts` (the seed runs locally only). Pure planning here: which listed
 * fields differ, what to send, a report to read before writing. Prices stay the panel's (the boss
 * sets them); relations, colours and media are not touched.
 */
export type TextCollection =
  'inst-services' | 'inst-objects' | 'inst-solutions' | 'pages' | 'posts' | 'site-settings'

/** The text fields the script may write, per collection (top-level keys of the seed data). */
export const TEXT_FIELDS: Readonly<Record<TextCollection, readonly string[]>> = {
  'inst-services': [
    'name',
    'menuCaption',
    'icon',
    'tile',
    'offer',
    'hero',
    'anchors',
    'packagesIntro',
    'packages',
    'priceIntro',
    'priceFactors',
    'faqHeading',
    'faq',
    'faqAside',
    'relatedHeading',
    'cta',
  ],
  'inst-objects': [
    'name',
    'menuCaption',
    'icon',
    'forWhom',
    'hero',
    'sceneTitle',
    'hotspots',
    'anchors',
    'problemsIntro',
    'problems',
    'dayIntro',
    'day',
    'lawIntro',
    'law',
    'mountainsIntro',
    'mountains',
    'realizationsHeading',
    'realizations',
    'prepareIntro',
    'prepare',
    'packagesHeading',
    'packages',
    'faqHeading',
    'faq',
    'cta',
    'foldOnPhone',
    'seo',
  ],
  'inst-solutions': ['name', 'description'],
  pages: ['seo'],
  posts: ['title', 'category', 'lead', 'content', 'seo'],
  'site-settings': ['shared'],
}

type Stored = { id: number | string } & Record<string, unknown>
export type FieldDiff = { path: string; before: unknown; after: unknown }
export type TextChange = {
  collection: TextCollection
  key: string
  id: Stored['id']
  /** What the PATCH sends: only the listed fields that differ. */
  data: Record<string, unknown>
  changes: FieldDiff[]
}

const isRecord = (v: unknown): v is Record<string, unknown> =>
  typeof v === 'object' && v !== null && !Array.isArray(v)

/** The panel's prices win: the tile's `priceFrom` and each package's `price` (by its place). */
function keepPrices(field: string, desired: unknown, stored: unknown): unknown {
  if (field === 'tile' && isRecord(desired) && isRecord(stored) && 'priceFrom' in stored)
    return { ...desired, priceFrom: stored.priceFrom }
  if (field === 'packages' && Array.isArray(desired)) {
    const rows = Array.isArray(stored) ? stored : []
    return desired.map((row, i) => {
      const old: unknown = rows[i]
      return isRecord(row) && isRecord(old) && 'price' in old ? { ...row, price: old.price } : row
    })
  }
  return desired
}

const items = (n: number) =>
  `${n} ${n === 1 ? 'pozycja' : n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 12 || n % 100 > 14) ? 'pozycje' : 'pozycji'}`

/** Leaves that differ, with their paths (`faq[1].answer`); a list of another length as one line. */
function diffs(stored: unknown, desired: unknown, path: string): FieldDiff[] {
  if (hasSameValues(stored, desired)) return []
  if (Array.isArray(desired)) {
    if (!Array.isArray(stored) || stored.length !== desired.length)
      return [
        {
          path,
          before: Array.isArray(stored) ? items(stored.length) : (stored ?? null),
          after: items(desired.length),
        },
      ]
    return desired.flatMap((item, i) => diffs(stored[i], item, `${path}[${i}]`))
  }
  if (isRecord(desired)) {
    const old = isRecord(stored) ? stored : {}
    return Object.entries(desired).flatMap(([k, v]) => diffs(old[k], v, `${path}.${k}`))
  }
  return [{ path, before: stored ?? null, after: desired ?? null }]
}

/** The change for one record, or `null` when its listed text fields already match. */
export function planTextChange(
  collection: TextCollection,
  key: string,
  stored: Stored,
  desired: Record<string, unknown>,
  fields: readonly string[] = TEXT_FIELDS[collection],
): TextChange | null {
  const data: Record<string, unknown> = {}
  const changes: FieldDiff[] = []
  for (const field of fields) {
    if (!(field in desired)) continue
    const wanted = keepPrices(field, desired[field], stored[field])
    const found = diffs(stored[field], wanted, field)
    if (found.length === 0) continue
    data[field] = wanted
    changes.push(...found)
  }
  return changes.length ? { collection, key, id: stored.id, data, changes } : null
}

const MAX = 118
const cell = (v: unknown) => {
  const text = typeof v === 'string' ? v : v === null ? '—' : JSON.stringify(v)
  const flat = text.replace(/\s+/g, ' ').replaceAll('|', '\\|')
  return flat.length > MAX ? `${flat.slice(0, MAX - 1)}…` : flat
}

/** Markdown read before writing (`--dry-run`) and kept with the PR as the file of panel changes. */
export function formatTextReport(changes: readonly TextChange[]): string {
  if (changes.length === 0) return 'Brak różnic: panel ma już te teksty.\n'
  const fields = changes.reduce((n, c) => n + c.changes.length, 0)
  const parts = [`${changes.length} rekordów, ${fields} pól do zmiany.\n`]
  for (const c of changes) {
    parts.push(`### ${c.collection} · ${c.key}\n\n| Pole | Było | Będzie |\n|---|---|---|`)
    for (const d of c.changes) parts.push(`| ${d.path} | ${cell(d.before)} | ${cell(d.after)} |`)
    parts.push('')
  }
  return parts.join('\n')
}
