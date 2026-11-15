/**
 * SEO 15.11: carries the Software guide posts (`seed/prokomsoftware/wpisy/*.md`) to another
 * database through its REST API (staging, production — the seed runs locally only). A post
 * missing in the panel is created published with the date of its file (a future date shows it
 * on that day). A post already there belongs to the panel: it is only reported when it differs
 * from the file, and overwritten only with `--update` (a draft waiting in the panel never).
 *
 *   pnpm software:posts <panel URL> [--out=<file.md>]                     — preview (the default)
 *   pnpm software:posts <panel URL> --write [--update] [--yes] [--out=…]  — write
 *   (= pnpm payload run src/seed/software/software-posts.ts -- …; flags after `--`, else
 *   `payload run` drops them and the run stays a preview)
 *
 * Login: INST_TEXTS_EMAIL / INST_TEXTS_PASSWORD (an admin of that panel — one pair for the panel
 * scripts, `.env.example`); locally falls back to SEED_ADMIN_*. Staging behind its site password
 * also INST_TEXTS_BASIC (`user:password` of the nginx password file). A non-local address must
 * be https and writes only with `--write --yes`.
 */
import dns from 'node:dns'
import { writeFileSync } from 'node:fs'

import { hasSameValues } from '../compare'
import { panelHeaders } from '../instalacje/texts'
import { guidePostData, guidePosts } from './posts'

type Doc = { id: number | string; slug?: string; _status?: string } & Record<string, unknown>

const args = process.argv.slice(2)
const base = args.find((a) => /^https?:\/\//.test(a))?.replace(/\/+$/, '')
// A preview unless `--write`: a dropped flag must never mean writing.
const write = args.includes('--write')
const update = args.includes('--update')
const confirmed = args.includes('--yes')
const out = args.find((a) => a.startsWith('--out='))?.slice('--out='.length)

/** Only `*.localhost` and 127.0.0.1 count as this computer. */
const LOCAL = /^http:\/\/(([^/@:]+\.)?localhost|127\.0\.0\.1)(:\d+)?$/
const LIMIT = 500

/** Node does not resolve `*.localhost` like browsers do (panel.localhost:3003): local runs only. */
function resolveLocalhost() {
  const systemLookup = dns.lookup
  dns.lookup = ((hostname: string, ...rest: unknown[]) =>
    (systemLookup as (...a: unknown[]) => void)(
      hostname.endsWith('.localhost') ? '127.0.0.1' : hostname,
      ...rest,
    )) as typeof dns.lookup
}

async function main() {
  if (!base) throw new Error('Podaj adres panelu, np. http://panel.localhost:3003')
  const local = LOCAL.test(base)
  if (local) resolveLocalhost()
  // The admin's password must not travel in plain text outside this computer.
  else if (!base.startsWith('https://')) throw new Error('Adres poza komputerem lokalnym: https://')
  if (!local && write && !confirmed)
    throw new Error('Zapis poza komputerem lokalnym wymaga --write --yes (najpierw podgląd).')
  const env = process.env
  // `||`: empty values from a copied .env.example fall back to the local seed admin.
  const email = env.INST_TEXTS_EMAIL || (local ? env.SEED_ADMIN_EMAIL : undefined)
  const password = env.INST_TEXTS_PASSWORD || (local ? env.SEED_ADMIN_PASSWORD : undefined)
  if (!email || !password) throw new Error('Brak INST_TEXTS_EMAIL / INST_TEXTS_PASSWORD.')
  const sitePassword = env.INST_TEXTS_BASIC || undefined

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

  const tenant = (await list('tenants', 'where[slug][equals]=software'))[0]?.id
  if (tenant === undefined) throw new Error('Brak tenanta „software” w tym panelu.')
  const inTenant = `where[tenant][equals]=${tenant}`
  const [solutions, posts] = await Promise.all([
    list('solutions', inTenant),
    list('posts', inTenant),
  ])
  const solutionIds = new Map(solutions.map((doc) => [String(doc.slug), Number(doc.id)]))
  const postDocs = new Map(posts.map((doc) => [String(doc.slug), doc]))

  type Row = { slug: string; date: string; action: string; run?: () => Promise<unknown> }
  const rows: Row[] = []
  for (const post of guidePosts()) {
    const data = { ...guidePostData(post, (slug) => solutionIds.get(slug)), _status: 'published' }
    const doc = postDocs.get(post.slug)
    const row = { slug: post.slug, date: post.publishedAt }
    if (!doc) {
      rows.push({
        ...row,
        action: 'utworzyć',
        run: () =>
          api('/api/posts?depth=0', { method: 'POST', body: JSON.stringify({ ...data, tenant }) }),
      })
    } else if (hasSameValues(doc, data)) rows.push({ ...row, action: 'bez zmian' })
    else if (doc._status === 'draft') rows.push({ ...row, action: 'szkic w panelu — pominięty' })
    else if (!update) rows.push({ ...row, action: 'różni się od pliku — zostaje (--update)' })
    else {
      rows.push({
        ...row,
        action: 'nadpisać plikiem',
        run: () =>
          api(`/api/posts/${doc.id}?depth=0`, { method: 'PATCH', body: JSON.stringify(data) }),
      })
    }
  }

  const head = `# Wpisy Software → ${base}\n\n${write ? 'Zapis.' : 'Podgląd, nic nie zapisano (zapis: --write).'}\n\n`
  const table =
    '| Wpis | Data | Akcja |\n|---|---|---|\n' +
    rows.map((r) => `| ${r.slug} | ${r.date} | ${r.action} |`).join('\n') +
    '\n'
  console.log(head + table)
  if (out) writeFileSync(out, head + table)
  if (!write) return

  const failed: string[] = []
  const todo = rows.filter((r) => r.run)
  for (const row of todo) {
    try {
      await row.run?.()
      console.log(`zapisano: ${row.slug} (${row.action})`)
    } catch (error) {
      failed.push(`${row.slug}: ${error instanceof Error ? error.message : error}`)
    }
  }
  console.log(`Gotowe: ${todo.length - failed.length} z ${todo.length} wpisów.`)
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
