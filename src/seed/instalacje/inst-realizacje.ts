/**
 * Carries the line's realizations with their photos to another panel through its REST API
 * (production, staging — the seed runs locally only; on 12.11.2026 production showed none).
 * Plan in `realizacje.ts`: creates the missing ones (published, with the clients' consent — boss
 * 01.11.2026), gives photos to those without; a realization edited in the panel stays as it is.
 *
 *   pnpm inst:realizacje <panel URL> [--out=<file.md>]            — preview (the default)
 *   pnpm inst:realizacje <panel URL> --write [--yes] [--out=…]    — write
 *   Without the alias: pnpm payload run src/seed/instalacje/inst-realizacje.ts -- <URL> …
 *   (flags after `--`, else `payload run` drops them and the run stays a preview)
 *
 * Login: INST_TEXTS_EMAIL / INST_TEXTS_PASSWORD (an admin of that panel); locally falls back to
 * SEED_ADMIN_*; staging behind its site password also INST_TEXTS_BASIC (`user:password`). A
 * non-local address must be https and writes only with `--write --yes`.
 */
import dns from 'node:dns'
import { readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'

import { findImportedFile } from '../biznes/map'
import { panelHeaders } from './texts'
import { realizationsToImport } from './map'
import {
  formatRealizationReport,
  planRealizations,
  type RealizationStep,
  unmatchedRealizations,
} from './realizacje'
import {
  REALIZATION_MEDIA_DIR,
  realizationPhotos,
  type RealizationPhoto,
  yearFromPhotos,
} from './realizationPhotos'

type Doc = { id: number | string } & Record<string, unknown>

const LOCAL = /^http:\/\/(([^/@:]+\.)?localhost|127\.0\.0\.1)(:\d+)?$/
const SOURCE = 'pro-kom.eu — realizacje (PRO-KOM)'

const args = process.argv.slice(2)
const base = args.find((a) => /^https?:\/\//.test(a))?.replace(/\/+$/, '')
const dryRun = !args.includes('--write')
const confirmed = args.includes('--yes')
const out = args.find((a) => a.startsWith('--out='))?.slice('--out='.length)

/** Node does not resolve `*.localhost` like browsers do: local runs only. */
function resolveLocalhost() {
  const systemLookup = dns.lookup
  dns.lookup = ((hostname: string, ...rest: unknown[]) =>
    (systemLookup as (...a: unknown[]) => void)(
      hostname.endsWith('.localhost') ? '127.0.0.1' : hostname,
      ...rest,
    )) as typeof dns.lookup
}

async function main() {
  if (!base) throw new Error('Podaj adres panelu, np. https://panel.pro-kom.eu')
  const local = LOCAL.test(base)
  if (local) resolveLocalhost()
  else if (!base.startsWith('https://')) throw new Error('Adres poza komputerem lokalnym: https://')
  if (!local && !dryRun && !confirmed)
    throw new Error('Zapis poza komputerem lokalnym wymaga --write --yes (najpierw podgląd).')
  const email = process.env.INST_TEXTS_EMAIL || (local ? process.env.SEED_ADMIN_EMAIL : undefined)
  const password =
    process.env.INST_TEXTS_PASSWORD || (local ? process.env.SEED_ADMIN_PASSWORD : undefined)
  if (!email || !password) throw new Error('Brak INST_TEXTS_EMAIL / INST_TEXTS_PASSWORD.')

  const sitePassword = process.env.INST_TEXTS_BASIC || undefined
  const login = await fetch(`${base}/api/users/login`, {
    method: 'POST',
    headers: panelHeaders(undefined, sitePassword),
    body: JSON.stringify({ email, password }),
  })
  if (!login.ok) throw new Error(`Logowanie: ${login.status}`)
  const { token } = (await login.json()) as { token: string }

  async function api<T>(url: string, init?: RequestInit): Promise<T> {
    const headers = panelHeaders(token, sitePassword)
    // A multipart upload sets its own Content-Type (with the boundary).
    if (typeof init?.body !== 'string') delete headers['Content-Type']
    const res = await fetch(`${base}${url}`, { ...init, headers })
    if (!res.ok) {
      const body = (await res.text()).slice(0, 300)
      throw new Error(`${init?.method ?? 'GET'} ${url}: ${res.status} ${body}`)
    }
    return (await res.json()) as T
  }

  const tenants = await api<{ docs: Doc[] }>('/api/tenants?where[slug][equals]=instalacje&depth=0')
  const tenant = tenants.docs[0]?.id
  if (tenant === undefined) throw new Error('Brak tenanta „instalacje” w tym panelu.')
  const stored = await api<{ docs: Doc[]; totalDocs: number }>(
    `/api/realizations?where[tenant][equals]=${tenant}&limit=200&depth=0&draft=true`,
  )
  if (stored.totalDocs > 200) throw new Error('Ponad 200 realizacji — sprawdź ręcznie.')

  const wanted = realizationsToImport()
  const photos = realizationPhotos()
  const steps = planRealizations(wanted, stored.docs, photos)
  const head = `# Realizacje Instalacji → ${base}\n\n${dryRun ? 'Podgląd, nic nie zapisano (zapis: --write).' : 'Zapis.'}\n\n`
  const extra = unmatchedRealizations(wanted, stored.docs)
  const tail = extra.length
    ? `\nW panelu, bez pary w repo (sprawdź, czy to nie duplikat): ${extra.map((r) => r.title).join(', ')}\n`
    : ''
  const report = head + formatRealizationReport(steps) + tail
  console.log(report)
  if (out) writeFileSync(out, report)
  if (dryRun) return

  /** The photo's media id: the one already uploaded (same file name), else a new upload. */
  async function mediaId(legacyId: number, photo: RealizationPhoto): Promise<Doc['id']> {
    const name = path.parse(photo.file).name
    const found = await api<{ docs: (Doc & { filename?: string | null })[] }>(
      `/api/media?where[tenant][equals]=${tenant}&where[filename][like]=${encodeURIComponent(name)}&limit=20&depth=0`,
    )
    const existing = findImportedFile(found.docs, photo.file)
    if (existing) return existing.id
    const form = new FormData()
    const bytes = readFileSync(path.resolve(REALIZATION_MEDIA_DIR, String(legacyId), photo.file))
    form.append('file', new Blob([bytes], { type: 'image/webp' }), photo.file)
    form.append('_payload', JSON.stringify({ alt: photo.alt, source: SOURCE, tenant }))
    const created = await api<{ doc: Doc }>('/api/media?depth=0', { method: 'POST', body: form })
    return created.doc.id
  }

  const failed: string[] = []
  let done = 0
  for (const step of steps.filter(
    (s): s is Exclude<RealizationStep, { kind: 'skip' }> => s.kind !== 'skip',
  )) {
    try {
      const ids: Doc['id'][] = []
      for (const photo of step.photos) ids.push(await mediaId(step.legacyId, photo))
      const year = yearFromPhotos(step.photos)
      if (step.kind === 'create') {
        const data = wanted.find((r) => r.legacyId === step.legacyId)
        await api('/api/realizations?depth=0', {
          method: 'POST',
          body: JSON.stringify({
            ...data,
            tenant,
            ...(ids.length && { photos: ids }),
            ...(year && { year }),
            _status: 'published',
          }),
        })
      } else {
        await api(`/api/realizations/${step.id}?depth=0`, {
          method: 'PATCH',
          body: JSON.stringify({ photos: ids, ...(step.yearMissing && year && { year }) }),
        })
      }
      done += 1
      console.log(`zapisano: ${step.legacyId} ${step.title} (${ids.length} zdjęć)`)
    } catch (error) {
      failed.push(
        `${step.legacyId} ${step.title}: ${error instanceof Error ? error.message : error}`,
      )
    }
  }
  console.log(`Gotowe: ${done} realizacji.`)
  // The token would stay valid until it expires: log out.
  await fetch(`${base}/api/users/logout`, {
    method: 'POST',
    headers: panelHeaders(token, sitePassword),
  }).catch(() => undefined)
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
