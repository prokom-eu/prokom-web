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
  // `layout`: the hero and CTA texts of a page's own block (`layoutWithBlockTexts`) — the home
  // page and the pages built in code (`FORM_PAGE_BLOCKS`).
  pages: ['seo', 'layout'],
  // `slug`: a post may move to a new address (D1, the former slug redirects).
  posts: ['slug', 'title', 'category', 'lead', 'content', 'seo'],
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
 * The stored value with the repo's values laid over it: objects keep their stored keys the repo
 * does not set (a link typed in the panel, row ids), list rows are matched by position and the
 * list has the repo's length.
 */
export function overlay(stored: unknown, desired: unknown): unknown {
  if (Array.isArray(desired)) {
    const rows = Array.isArray(stored) ? stored : []
    return desired.map((row, i) => overlay(rows[i], row))
  }
  if (isRecord(desired)) {
    const base = isRecord(stored) ? stored : {}
    const laid = Object.entries(desired).map(([k, v]) => [k, overlay(base[k], v)] as const)
    return { ...base, ...Object.fromEntries(laid) }
  }
  return desired
}

/** Text groups of a page block the script carries (the hero and the CTA band). */
export type BlockTexts = Readonly<Record<string, Readonly<Record<string, unknown>>>>

/**
 * A page's stored layout with the repo's texts merged into each group (`hero`, `cta`) of its block
 * of `blockType`; the group's other fields (trust points of the home page), the other blocks and
 * the ids stay as stored. `null` when the page has no such block.
 */
export function layoutWithBlockTexts(
  layout: unknown,
  blockType: string,
  texts: BlockTexts,
): unknown[] | null {
  if (!Array.isArray(layout)) return null
  let found = false
  const next = layout.map((block) => {
    if (!isRecord(block) || block.blockType !== blockType) return block
    found = true
    const merged = Object.entries(texts).map(([group, values]) => {
      const stored = block[group]
      return [group, { ...(isRecord(stored) ? stored : {}), ...values }] as const
    })
    return { ...block, ...Object.fromEntries(merged) }
  })
  return found ? next : null
}

/** The home page's layout with the repo's hero texts in its `instHome` block (INST-6 PR2). */
export const homeLayoutWithHero = (layout: unknown, hero: Readonly<Record<string, string>>) =>
  layoutWithBlockTexts(layout, 'instHome', { hero })

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

/**
 * Headers of a request to the panel. Staging sits behind an nginx site password (Basic auth),
 * which takes the Authorization header — then the Payload token travels as its cookie instead
 * (accepted from a client without Origin while `csrf` is empty: no `serverURL` in the config).
 */
export function panelHeaders(token: string | undefined, sitePassword?: string) {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  if (sitePassword) {
    headers.Authorization = `Basic ${Buffer.from(sitePassword).toString('base64')}`
    if (token) headers.Cookie = `payload-token=${token}`
  } else if (token) headers.Authorization = `JWT ${token}`
  return headers
}
