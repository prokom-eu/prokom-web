import { hasSameValues } from '../compare'

/**
 * Runda v6 D4: the texts of the Instalacje pages that live in the panel, carried to staging and
 * production by `inst-texts.ts` (the seed runs locally only). Pure planning here: which listed
 * fields differ, what to send, a report to read before writing. Prices stay the panel's (the boss
 * sets them); relations, colours and media are not touched.
 */
export type TextCollection =
  'inst-services' | 'inst-objects' | 'inst-solutions' | 'pages' | 'posts' | 'site-settings'

/**
 * The text fields the script may write, per collection (top-level keys of the seed data). Two
 * look settings ride along on purpose: `icon` (the icon review of runda v6 §1.5 lives in the
 * panel too) and `foldOnPhone` (folds follow the sections the texts belong to).
 */
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
  // `layout` on the home page only: the hero texts of its `instHome` block (`homeLayoutWithHero`).
  pages: ['seo', 'layout'],
  posts: ['title', 'category', 'lead', 'content', 'seo'],
  // `footer`: only its line description (`footer.text`, INST-6 PR2).
  'site-settings': ['shared', 'footer'],
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

/**
 * The panel's prices win: the tile's `priceFrom` and each package's `price` — from the stored
 * package with the same name (wherever it moved), else from the one at its place; the report
 * notes a price kept from a package of another name.
 */
function keepPrices(
  field: string,
  desired: unknown,
  stored: unknown,
): { value: unknown; notes: FieldDiff[] } {
  if (field === 'tile' && isRecord(desired) && isRecord(stored) && 'priceFrom' in stored)
    return { value: { ...desired, priceFrom: stored.priceFrom }, notes: [] }
  if (field !== 'packages' || !Array.isArray(desired)) return { value: desired, notes: [] }
  const rows = (Array.isArray(stored) ? stored : []).filter(isRecord)
  const notes: FieldDiff[] = []
  const value = desired.map((row, i) => {
    if (!isRecord(row)) return row
    const old = rows.find((r) => r.name === row.name) ?? rows[i]
    if (!old || !('price' in old)) return row
    if (old.name !== row.name)
      notes.push({
        path: `packages[${i}].price`,
        before: old.price,
        after: `zachowana z „${String(old.name)}”`,
      })
    return { ...row, price: old.price }
  })
  return { value, notes }
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
    const { value: wanted, notes } = keepPrices(field, desired[field], stored[field])
    const found = diffs(stored[field], wanted, field)
    if (found.length === 0) continue
    data[field] = wanted
    changes.push(...found, ...notes)
  }
  return changes.length ? { collection, key, id: stored.id, data, changes } : null
}

/**
 * The home page's stored layout with the repo's hero texts in its `instHome` block; the trust
 * points, the other blocks and the ids stay as stored. `null` when the page has no such block.
 */
export function homeLayoutWithHero(
  layout: unknown,
  hero: Readonly<Record<string, string>>,
): unknown[] | null {
  if (!Array.isArray(layout)) return null
  let found = false
  const next = layout.map((block) => {
    if (!isRecord(block) || block.blockType !== 'instHome') return block
    found = true
    return { ...block, hero: { ...(isRecord(block.hero) ? block.hero : {}), ...hero } }
  })
  return found ? next : null
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
