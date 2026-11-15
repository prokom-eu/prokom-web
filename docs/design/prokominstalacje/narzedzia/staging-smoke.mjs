// Smoke test of prokominstalacje.pl on staging (INST-3): every address of the line, sitemap,
// robots, llms.txt, 404 and JSON-LD. Complements scripts/smoke.sh (the pipeline checks only the
// routes that work without panel content).
//
// Usage (staging is behind basic auth):
//   SMOKE_AUTH=user:password node docs/design/prokominstalacje/narzedzia/staging-smoke.mjs [base-url]
// Default base: https://staging.prokominstalacje.pl. Exit code 1 on any failure.
// HTML of the pages with JSON-LD lands in tmp/staging-html/ — paste it into the Rich Results Test
// („Code” tab), because Google cannot open a page behind the staging login.
import { mkdirSync, writeFileSync } from 'node:fs'

import { INST_PAGES } from '../../../../tests/e2e/instalacje/pages.ts'

const base = (process.argv[2] ?? 'https://staging.prokominstalacje.pl').replace(/\/$/, '')
const auth = process.env.SMOKE_AUTH
const headers = auth ? { Authorization: `Basic ${Buffer.from(auth).toString('base64')}` } : {}
const TITLE_MAX = 60 + ' | PRO-KOM Instalacje'.length
const BANNED = ['[SZEF', 'WhatsApp', 'wa.me', 'W przygotowaniu', 'dane przykładowe']
const outDir = 'tmp/staging-html'
mkdirSync(outDir, { recursive: true })

let failures = 0
const report = (ok, line) => {
  if (!ok) failures++
  console.log(`${ok ? 'ok  ' : 'FAIL'}  ${line}`)
}

async function get(path) {
  const res = await fetch(base + path, { headers, redirect: 'manual' })
  return { status: res.status, headers: res.headers, body: await res.text() }
}

const text = (html) =>
  html
    .replace(/<script[\s\S]*?<\/script>/g, ' ')
    .replace(/<style[\s\S]*?<\/style>/g, ' ')
    .replace(/<[^>]+>/g, ' ')

function jsonLdTypes(html) {
  const types = []
  for (const [, raw] of html.matchAll(/<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)) {
    try {
      const walk = (node) => {
        if (Array.isArray(node)) return node.forEach(walk)
        if (node && typeof node === 'object') {
          if (node['@type']) types.push([node['@type']].flat().join('/'))
          Object.values(node).forEach(walk)
        }
      }
      walk(JSON.parse(raw))
    } catch {
      types.push('INVALID-JSON')
    }
  }
  return [...new Set(types)]
}

const first = await get('/')
if (first.status === 401) {
  console.error('401 — set SMOKE_AUTH=user:password (staging login).')
  process.exit(1)
}

const ldSummary = []
for (const path of INST_PAGES) {
  const { status, headers: h, body } = await get(path)
  const title = body.match(/<title>([^<]*)<\/title>/)?.[1] ?? ''
  const found = BANNED.filter((w) => text(body).includes(w))
  const types = jsonLdTypes(body)
  const noindex = (h.get('x-robots-tag') ?? '').includes('noindex')
  report(
    status === 200 && found.length === 0 && title.length <= TITLE_MAX && !types.includes('INVALID-JSON') && noindex,
    `${status} ${path}  title ${title.length}${found.length ? `  words: ${found.join(', ')}` : ''}${noindex ? '' : '  no noindex'}`,
  )
  if (types.length) {
    ldSummary.push(`${path}: ${types.join(', ')}`)
    writeFileSync(`${outDir}/${path === '/' ? 'start' : path.slice(1).replaceAll('/', '_')}.html`, body)
  }
}

const sitemap = await get('/sitemap.xml')
const locs = [...sitemap.body.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1])
const foreign = locs.filter((l) => !l.startsWith(base))
report(sitemap.status === 200 && locs.length > 0 && foreign.length === 0, `sitemap.xml  ${locs.length} addresses${foreign.length ? `, other hosts: ${foreign.slice(0, 3).join(' ')}` : ''}`)
const missing = INST_PAGES.filter((p) => !locs.includes(base + (p === '/' ? '' : p)) && !locs.includes(base + p))
console.log(`      pages not in sitemap: ${missing.length ? missing.join(' ') : 'none'}`)

const robots = await get('/robots.txt')
report(robots.status === 200 && /Disallow:\s*\/\s*$/m.test(robots.body), `robots.txt  ${robots.body.trim().split('\n').join(' · ')}`)

const llms = await get('/llms.txt')
report(llms.status === 200 && llms.body.length > 200, `llms.txt  ${llms.status}, ${llms.body.length} chars`)

const missingPage = await get('/nie-ma-takiej-strony-inst3')
report(
  missingPage.status === 404 && missingPage.body.includes('Nie znaleziono strony'),
  `404  ${missingPage.status}, line 404 page: ${missingPage.body.includes('Nie znaleziono strony')}`,
)

console.log('\nJSON-LD per page:\n  ' + ldSummary.join('\n  '))
console.log(`\nHTML for the Rich Results Test: ${outDir}/`)
console.log(failures ? `\n${failures} failure(s)` : '\nAll green.')
process.exit(failures ? 1 : 0)
