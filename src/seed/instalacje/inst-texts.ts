/**
 * Runda v6 D4: carries the Instalacje texts that live in the panel to another database through
 * its REST API (staging, production — the seed runs locally only). Desired values come from the
 * seed mapping (`map.ts` and friends), so a text change in the repo reaches the panel by one run.
 * Only the text fields of `texts.ts`; prices, relations, colours and media stay the panel's.
 *
 *   pnpm inst:texts <panel URL> [--dry-run] [--out=<file.md>]     — preview (the default)
 *   pnpm inst:texts <panel URL> --write [--yes] [--out=<file.md>]  — write the differences
 *   (= pnpm payload run src/seed/instalacje/inst-texts.ts -- …; flags after `--`, else
 *   `payload run` drops them and the run stays a preview)
 *
 * Login: INST_TEXTS_EMAIL / INST_TEXTS_PASSWORD (an admin of that panel); locally falls back to
 * SEED_ADMIN_EMAIL / SEED_ADMIN_PASSWORD. A non-local address writes only with `--write --yes`;
 * read the preview report first.
 */
import dns from 'node:dns'
import { writeFileSync } from 'node:fs'

import { INSTALACJE_SHARED } from '../shared/instalacje'
import { rodoPost } from './guide'
import {
  objectData,
  objectsToImport,
  pagesToImport,
  type Refs,
  serviceData,
  servicesToImport,
  solutionsToImport,
} from './map'
import { formatTextReport, planTextChange, type TextChange, type TextCollection } from './texts'

type Doc = { id: number | string; _status?: string } & Record<string, unknown>

// Node does not resolve `*.localhost` like browsers do (local panels: panel.localhost:3002).
const systemLookup = dns.lookup
dns.lookup = ((hostname: string, ...rest: unknown[]) =>
  (systemLookup as (...a: unknown[]) => void)(
    hostname.endsWith('.localhost') ? '127.0.0.1' : hostname,
    ...rest,
  )) as typeof dns.lookup

const args = process.argv.slice(2)
const base = args.find((a) => /^https?:\/\//.test(a))?.replace(/\/+$/, '')
// A preview unless `--write`: `payload run` drops flags given without `--`, so a missing flag
// must never mean writing. `--dry-run` (D4) is the default and accepted as such.
const dryRun = !args.includes('--write')
const outFlag = args.indexOf('--out')
const out =
  args.find((a) => a.startsWith('--out='))?.slice('--out='.length) ??
  (outFlag >= 0 ? args[outFlag + 1] : undefined)
const confirmed = args.includes('--yes')

const DRAFTS: ReadonlySet<TextCollection> = new Set([
  'inst-services',
  'inst-objects',
  'inst-solutions',
  'pages',
  'posts',
])

async function main() {
  if (!base) throw new Error('Podaj adres panelu, np. http://panel.localhost:3002')
  const local = /^https?:\/\/[^/]*(localhost|127\.0\.0\.1)(:\d+)?$/.test(base)
  if (!local && !dryRun && !confirmed)
    throw new Error('Zapis poza komputerem lokalnym wymaga --write --yes (najpierw podgląd).')
  const email = process.env.INST_TEXTS_EMAIL ?? (local ? process.env.SEED_ADMIN_EMAIL : undefined)
  const password =
    process.env.INST_TEXTS_PASSWORD ?? (local ? process.env.SEED_ADMIN_PASSWORD : undefined)
  if (!email || !password) throw new Error('Brak INST_TEXTS_EMAIL / INST_TEXTS_PASSWORD.')

  const login = await fetch(`${base}/api/users/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })
  if (!login.ok) throw new Error(`Logowanie: ${login.status}`)
  const { token } = (await login.json()) as { token: string }

  async function api<T>(path: string, init?: RequestInit): Promise<T> {
    const res = await fetch(`${base}${path}`, {
      ...init,
      headers: { 'Content-Type': 'application/json', Authorization: `JWT ${token}` },
    })
    if (!res.ok) {
      const body = (await res.text()).slice(0, 300)
      throw new Error(`${init?.method ?? 'GET'} ${path}: ${res.status} ${body}`)
    }
    return (await res.json()) as T
  }
  const list = async (collection: string, where: string) =>
    (await api<{ docs: Doc[] }>(`/api/${collection}?${where}&limit=500&depth=0&draft=true`)).docs

  const tenants = await list('tenants', 'where[slug][equals]=instalacje')
  const tenant = tenants[0]?.id
  if (tenant === undefined) throw new Error('Brak tenanta „instalacje” w tym panelu.')
  const inTenant = `where[tenant][equals]=${tenant}`

  const [services, objects, solutions, pages, posts, settings] = await Promise.all([
    list('inst-services', inTenant),
    list('inst-objects', inTenant),
    list('inst-solutions', inTenant),
    list('pages', inTenant),
    list('posts', inTenant),
    list('site-settings', inTenant),
  ])
  const byKey = (docs: Doc[], field: string) => new Map(docs.map((d) => [String(d[field]), d]))
  const serviceDocs = byKey(services, 'key')
  const objectDocs = byKey(objects, 'key')
  const ids = (docs: Map<string, Doc>) => (key: string) => {
    const id = docs.get(key)?.id
    return typeof id === 'number' ? id : undefined
  }
  const refs: Refs = { service: ids(serviceDocs), object: ids(objectDocs) }

  const changes: TextChange[] = []
  const missing: string[] = []
  const plan = (collection: TextCollection, key: string, doc: Doc | undefined, data: object) => {
    if (!doc) return void missing.push(`${collection} · ${key}`)
    const change = planTextChange(collection, key, doc, data as Record<string, unknown>)
    if (change) changes.push(change)
  }
  for (const item of servicesToImport())
    plan('inst-services', item.menu.k, serviceDocs.get(item.menu.k), serviceData(item, refs))
  for (const item of objectsToImport())
    plan('inst-objects', item.page.k, objectDocs.get(item.page.k), objectData(item, refs))
  const solutionDocs = byKey(solutions, 'legacyId')
  for (const item of solutionsToImport())
    plan('inst-solutions', String(item.legacyId), solutionDocs.get(String(item.legacyId)), {
      name: item.data.name,
      description: item.data.description,
    })
  const pageDocs = byKey(pages, 'slug')
  for (const page of pagesToImport())
    plan('pages', page.slug, pageDocs.get(page.slug), { seo: page.seo })
  const post = rodoPost()
  plan('posts', post.slug, byKey(posts, 'slug').get(post.slug), {
    title: post.title,
    category: post.category,
    lead: post.lead,
    content: post.content,
    seo: post.seo,
  })
  // The shared group holds the panel's contact data too: only the line's „O firmie” numbers.
  const site = settings[0]
  if (site) {
    const shared = (site.shared ?? {}) as Record<string, unknown>
    const about = (shared.about ?? {}) as Record<string, unknown>
    plan('site-settings', 'shared.about.stats', site, {
      shared: { ...shared, about: { ...about, stats: INSTALACJE_SHARED.about?.stats ?? [] } },
    })
  }

  const report = formatTextReport(changes)
  const head = `# Teksty Instalacji → ${base}\n\n${dryRun ? 'Podgląd, nic nie zapisano (zapis: --write).' : 'Zapis.'}\n\n`
  const tail = missing.length ? `\nBrak w panelu (pominięte): ${missing.join(', ')}\n` : ''
  console.log(head + report + tail)
  if (out) writeFileSync(out, head + report + tail)
  if (dryRun) return

  for (const c of changes) {
    const status = DRAFTS.has(c.collection)
      ? c.collection.startsWith('inst-')
        ? 'published'
        : // Pages and posts keep their state: never published nor unpublished by the script.
          (([...pages, ...posts].find((d) => d.id === c.id)?._status as string | undefined) ??
          'draft')
      : undefined
    await api(`/api/${c.collection}/${c.id}?depth=0`, {
      method: 'PATCH',
      body: JSON.stringify(status ? { ...c.data, _status: status } : c.data),
    })
    console.log(`zapisano: ${c.collection} · ${c.key} (${c.changes.length} pól)`)
  }
  console.log(`Gotowe: ${changes.length} rekordów.`)
}

// `payload run` ends the process after the import: the work is awaited at the top level.
try {
  await main()
} catch (error) {
  console.error(error instanceof Error ? error.message : error)
  process.exitCode = 1
}
