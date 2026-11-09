#!/usr/bin/env node
// BIZ-3 §10.2 / §11: title and description lengths, JSON-LD types and og:image of every page in
// `sitemap.xml` of a running site. Usage:
//   node scripts/biznes-seo-audyt.mjs [origin] [--all] [--json]
// origin defaults to http://biznes.localhost:$PORT (PORT from the environment, else 3001).
// Prints only pages outside the limits (title 30–60, description 100–155, no BreadcrumbList on a
// page with crumbs, no og:image); `--all` prints every page.
import { request } from 'node:http'

const args = process.argv.slice(2)
const origin =
  args.find((arg) => arg.startsWith('http')) ??
  `http://biznes.localhost:${process.env.PORT ?? 3001}`
const all = args.includes('--all')
const json = args.includes('--json')

// Node does not resolve `*.localhost`: connect to 127.0.0.1 with the Host header of the site.
const target = new URL(origin)
const get = (path) =>
  new Promise((resolve, reject) => {
    const local = target.hostname.endsWith('.localhost')
    const req = request(
      {
        host: local ? '127.0.0.1' : target.hostname,
        port: target.port || 80,
        path,
        headers: { host: target.host },
      },
      (res) => {
        let body = ''
        res.setEncoding('utf8')
        res.on('data', (chunk) => (body += chunk))
        res.on('end', () => resolve({ status: res.statusCode, text: body }))
      },
    )
    req.on('error', reject)
    req.end()
  })

const decode = (text) =>
  text
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#x27;|&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
const meta = (html, name) =>
  decode(
    html.match(new RegExp(`<meta[^>]+(?:name|property)="${name}"[^>]+content="([^"]*)"`))?.[1] ??
      '',
  )

const sitemap = (await get('/sitemap.xml')).text
const paths = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => new URL(m[1]).pathname)

const rows = []
// A few requests at once: the dev server compiles routes on the first visit.
const queue = [...paths]
const worker = async () => {
  for (let path = queue.shift(); path; path = queue.shift()) {
    rows.push(await measure(path))
    process.stderr.write(`
${rows.length}/${paths.length}`)
  }
}
async function measure(path) {
  const response = await get(path)
  const html = response.text
  const title = decode(html.match(/<title>([^<]*)<\/title>/)?.[1] ?? '')
  const description = meta(html, 'description')
  const types = [...html.matchAll(/"@type":"([A-Za-z]+)"/g)].map((m) => m[1])
  const crumbs = /aria-label="(Okruszki|Ścieżka)/.test(html)
  const row = {
    path,
    status: response.status,
    title,
    titleLength: [...title].length,
    descriptionLength: [...description].length,
    breadcrumbList: types.includes('BreadcrumbList'),
    itemList: types.includes('ItemList'),
    ogImage: Boolean(meta(html, 'og:image')),
    crumbs,
  }
  row.problems = [
    row.status !== 200 && `HTTP ${row.status}`,
    (row.titleLength < 30 || row.titleLength > 60) && `tytuł ${row.titleLength}`,
    (row.descriptionLength < 100 || row.descriptionLength > 155) && `opis ${row.descriptionLength}`,
    crumbs && !row.breadcrumbList && 'bez BreadcrumbList',
    !row.ogImage && 'bez og:image',
  ].filter(Boolean)
  return row
}
await Promise.all(Array.from({ length: 4 }, worker))
rows.sort((a, b) => a.path.localeCompare(b.path))
process.stderr.write('\n')

if (json) {
  console.log(JSON.stringify(rows, null, 2))
} else {
  for (const row of rows) {
    if (all || row.problems.length) {
      console.log(`${row.path}\t${row.problems.join(', ') || 'ok'}\t${row.title}`)
    }
  }
  const bad = rows.filter((row) => row.problems.length).length
  console.log(`\nStron: ${rows.length} · z uwagami: ${bad}`)
}
