/**
 * Runda v6 D4: carries the Instalacje texts that live in the panel to another database through
 * its REST API (staging, production — the seed runs locally only). Desired values come from the
 * seed mapping (`map.ts`, `home.ts` and friends), so a text change in the repo reaches the panel by one run.
 * Only the text fields of `texts.ts`; prices, relations, colours and media stay the panel's.
 *
 *   pnpm inst:texts <panel URL> [--dry-run] [--out=<file.md>]     — preview (the default)
 *   pnpm inst:texts <panel URL> --write [--yes] [--out=<file.md>]  — write the differences
 *   (= pnpm payload run src/seed/instalacje/inst-texts.ts -- …; flags after `--`, else
 *   `payload run` drops them and the run stays a preview)
 *
 * Login: INST_TEXTS_EMAIL / INST_TEXTS_PASSWORD (an admin of that panel); locally falls back to
 * SEED_ADMIN_EMAIL / SEED_ADMIN_PASSWORD; staging behind its site password also INST_TEXTS_BASIC
 * (`user:password` of the nginx password file). A non-local address must be https and writes only with
 * `--write --yes`; read the preview report first. Records with a draft waiting in the panel are
 * left out (listed in the report); pages and posts keep their publication state.
 */
import dns from 'node:dns'
import { writeFileSync } from 'node:fs'

import { INSTALACJE_SHARED } from '../shared/instalacje'
import { HOME_SLUG } from '../../lib/pages/slug'
import { formerSlugOf, guidePostsToImport } from './guide'
import { INSTALACJE_FOOTER_TEXT } from './contact'
import { FORM_PAGE_BLOCKS } from './formPages'
import { HOME_HERO_TEXTS, HOME_SEO } from './home'
import {
  objectData,
  objectsToImport,
  pagesToImport,
  type Refs,
  serviceData,
  servicesToImport,
  solutionsToImport,
} from './map'
import {
  formatTextReport,
  homeLayoutWithHero,
  layoutWithBlockTexts,
  overlay,
  panelHeaders,
  planTextChange,
  type TextChange,
  type TextCollection,
} from './texts'

type Doc = { id: number | string; _status?: string } & Record<string, unknown>

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
/** Only `*.localhost` and 127.0.0.1 count as this computer (no `mylocalhost`). */
const LOCAL = /^http:\/\/(([^/@:]+\.)?localhost|127\.0\.0\.1)(:\d+)?$/
const LIMIT = 500

/** Node does not resolve `*.localhost` like browsers do (panel.localhost:3002): local runs only. */
function resolveLocalhost() {
  const systemLookup = dns.lookup
  dns.lookup = ((hostname: string, ...rest: unknown[]) =>
    (systemLookup as (...a: unknown[]) => void)(
      hostname.endsWith('.localhost') ? '127.0.0.1' : hostname,
      ...rest,
    )) as typeof dns.lookup
}

async function main() {
  if (!base) throw new Error('Podaj adres panelu, np. http://panel.localhost:3002')
  const local = LOCAL.test(base)
  if (local) resolveLocalhost()
  // The admin's password must not travel in plain text outside this computer.
  else if (!base.startsWith('https://')) throw new Error('Adres poza komputerem lokalnym: https://')
  if (!local && !dryRun && !confirmed)
    throw new Error('Zapis poza komputerem lokalnym wymaga --write --yes (najpierw podgląd).')
  // `||`: empty values from a copied .env.example fall back to the local seed admin.
  const email = process.env.INST_TEXTS_EMAIL || (local ? process.env.SEED_ADMIN_EMAIL : undefined)
  const password =
    process.env.INST_TEXTS_PASSWORD || (local ? process.env.SEED_ADMIN_PASSWORD : undefined)
  if (!email || !password) throw new Error('Brak INST_TEXTS_EMAIL / INST_TEXTS_PASSWORD.')
  // Staging: the nginx site password as `user:password` (empty elsewhere).
  const sitePassword = process.env.INST_TEXTS_BASIC || undefined

  const login = await fetch(`${base}/api/users/login`, {
    method: 'POST',
    headers: panelHeaders(undefined, sitePassword),
    body: JSON.stringify({ email, password }),
  })
  if (!login.ok) throw new Error(`Logowanie: ${login.status}`)
  const { token } = (await login.json()) as { token: string }

  async function api<T>(path: string, init?: RequestInit): Promise<T> {
    const res = await fetch(`${base}${path}`, {
      ...init,
      headers: panelHeaders(token, sitePassword),
    })
    if (!res.ok) {
      const body = (await res.text()).slice(0, 300)
      throw new Error(`${init?.method ?? 'GET'} ${path}: ${res.status} ${body}`)
    }
    return (await res.json()) as T
  }
  /** The latest version of each record (a newer draft included: it is what the panel shows). */
  const list = async (collection: string, where: string) => {
    const page = await api<{ docs: Doc[]; totalDocs: number }>(
      `/api/${collection}?${where}&limit=${LIMIT}&depth=0&draft=true`,
    )
    if (page.totalDocs > LIMIT) throw new Error(`${collection}: ponad ${LIMIT} rekordów`)
    return page.docs
  }

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

  const changes: (TextChange & { status?: string })[] = []
  const missing: string[] = []
  const drafts: string[] = []
  const plan = (collection: TextCollection, key: string, doc: Doc | undefined, data: object) => {
    if (!doc) return void missing.push(`${collection} · ${key}`)
    const change = planTextChange(collection, key, doc, data as Record<string, unknown>)
    if (!change) return
    // A draft waiting in the panel (the boss's prices, texts): never published by the script.
    if (collection.startsWith('inst-') && doc._status === 'draft')
      return void drafts.push(`${collection} · ${key}`)
    changes.push({ ...change, status: doc._status })
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
  for (const page of pagesToImport()) {
    const doc = pageDocs.get(page.slug)
    // A page built in code: the hero and CTA texts of its block too (INST-6 PR3).
    const block = FORM_PAGE_BLOCKS[page.slug]?.() as unknown as Record<string, unknown> | undefined
    const texts = Object.fromEntries(
      ['hero', 'cta'].flatMap((g) =>
        block?.[g] ? [[g, block[g] as Record<string, unknown>]] : [],
      ),
    )
    const layout =
      doc && block ? layoutWithBlockTexts(doc.layout, String(block.blockType), texts) : null
    plan('pages', page.slug, doc, { seo: page.seo, ...(layout && { layout }) })
  }
  // The home page: its SEO and the hero texts of the `instHome` block (INST-6 PR2).
  const home = pageDocs.get(HOME_SLUG)
  const homeLayout = home ? homeLayoutWithHero(home.layout, HOME_HERO_TEXTS) : null
  plan('pages', HOME_SLUG, home, { seo: HOME_SEO, ...(homeLayout && { layout: homeLayout }) })
  // INST-6 PR5: the guide posts of `dane/wpisy` — found by slug, or by the former slug (D1: the
  // slug changes too); a post missing in the panel is created on `--write`.
  const postDocs = byKey(posts, 'slug')
  const newPosts: ReturnType<typeof guidePostsToImport> = []
  for (const post of guidePostsToImport()) {
    const former = formerSlugOf(post.slug)
    const doc = postDocs.get(post.slug) ?? (former ? postDocs.get(former) : undefined)
    if (!doc) {
      newPosts.push(post)
      continue
    }
    const { publishedAt: _publishedAt, ...texts } = post
    plan('posts', post.slug, doc, texts)
  }
  // The shared group holds the panel's contact data too: only the line's template texts (a group
  // sent in part keeps its other fields on update — checked locally, INST-6 PR2).
  const site = settings[0]
  if (site) {
    // INST-6 PR4: the line's texts of the shared Kontakt and O firmie templates, laid over the
    // stored groups (a link or a row typed in the panel stays). Settings that are not texts —
    // the salons shown, the place kind, the confirmed authorisations — stay the panel's.
    const stored = (site.shared ?? {}) as Record<string, unknown>
    const omit = (group: object | undefined, keys: readonly string[]) =>
      Object.fromEntries(Object.entries(group ?? {}).filter(([k]) => !keys.includes(k)))
    plan('site-settings', 'shared.contact + shared.about', site, {
      shared: {
        contact: overlay(
          stored.contact,
          omit(INSTALACJE_SHARED.contact, ['salonKeys', 'placeKind']),
        ),
        about: overlay(stored.about, omit(INSTALACJE_SHARED.about, ['auth'])),
      },
    })
    plan('site-settings', 'footer.text', site, { footer: { text: INSTALACJE_FOOTER_TEXT } })
  }

  const report = formatTextReport(changes)
  const head = `# Teksty Instalacji → ${base}\n\n${dryRun ? 'Podgląd, nic nie zapisano (zapis: --write).' : 'Zapis.'}\n\n`
  const tail =
    (drafts.length ? `\nSzkic w panelu — pominięte, sprawdź ręcznie: ${drafts.join(', ')}\n` : '') +
    (missing.length ? `\nBrak w panelu (pominięte): ${missing.join(', ')}\n` : '') +
    (newPosts.length
      ? `\nNowe wpisy Poradnika (utworzone przy --write): ${newPosts.map((p) => p.slug).join(', ')}\n`
      : '')
  console.log(head + report + tail)
  if (out) writeFileSync(out, head + report + tail)
  if (dryRun) return

  const failed: string[] = []
  for (const c of changes) {
    // Published stays published. A draft (pages, posts) gets a new draft version (`?draft=true`,
    // no `_status`): the published record is neither touched nor unpublished.
    const asDraft = DRAFTS.has(c.collection) && c.status !== 'published'
    const body = DRAFTS.has(c.collection) && !asDraft ? { ...c.data, _status: 'published' } : c.data
    try {
      await api(`/api/${c.collection}/${c.id}?depth=0${asDraft ? '&draft=true' : ''}`, {
        method: 'PATCH',
        body: JSON.stringify(body),
      })
      console.log(`zapisano: ${c.collection} · ${c.key} (${c.changes.length} pól)`)
    } catch (error) {
      failed.push(`${c.collection} · ${c.key}: ${error instanceof Error ? error.message : error}`)
    }
  }
  for (const post of newPosts) {
    try {
      await api('/api/posts?depth=0', {
        method: 'POST',
        body: JSON.stringify({ ...post, tenant, _status: 'published' }),
      })
      console.log(`utworzono: posts · ${post.slug}`)
    } catch (error) {
      failed.push(`posts · ${post.slug}: ${error instanceof Error ? error.message : error}`)
    }
  }
  const all = changes.length + newPosts.length
  console.log(`Gotowe: ${all - failed.length} z ${all} rekordów.`)
  if (failed.length) {
    console.error(`Niezapisane:\n${failed.join('\n')}`)
    process.exitCode = 1
  }
}

// `payload run` ends the process after the import: the work is awaited at the top level.
try {
  await main()
} catch (error) {
  console.error(error instanceof Error ? error.message : error)
  process.exitCode = 1
}
