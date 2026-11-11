// Content parity of two copies of prokombiznes.pl (NAPRAWA-0911, runbook §2b): is the content of
// B (staging, production) the content of A (the same code locally after `pnpm seed`)?
//   node scripts/porownaj-tresc.mjs http://biznes.localhost:3001 https://staging.prokombiznes.pl
// For each page of PAGES: the number of H2 and <section> in <main> and the length of its text.
// Error (exit 1) when B has less than 80% of A in any of them — e.g. a page the seed left with an
// old layout. Required after every scripts/staging-content.sh and before scripts/prod-content.sh.
// Basic auth: TRESC_AUTH_A / TRESC_AUTH_B = user:password (staging is behind a login).
// TRESC_HOST_A / TRESC_HOST_B: the site's host when the address is a tunnel, e.g. B =
// http://127.0.0.1:3999 (ssh -L 3999:127.0.0.1:<APP_PORT> prokom-vps) with
// TRESC_HOST_B=staging.prokombiznes.pl — the app directly, without the staging login.
// `*.localhost` is reached at 127.0.0.1 with the Host header (Node does not resolve it).
// Visibility (PRODUKCJA-BIZNES-1211 P0, runbook §2b — required after every content import):
//   node scripts/porownaj-tresc.mjs --widocznosc https://staging.prokombiznes.pl
// opens the pages of scripts/widocznosc.mjs in Chromium (1440 and 390, motion on), scrolls like
// a visitor and fails (exit 1) on any section still hidden — H2 counts cannot see that.
// Login: TRESC_AUTH = user:password. Not through a tunnel (Chromium sets its own Host header).
import { request as httpRequest } from 'node:http'
import { request as httpsRequest } from 'node:https'
import { isIP } from 'node:net'
import { fileURLToPath } from 'node:url'

export const PAGES = [
  '/',
  '/gopos',
  '/insert',
  '/opieka-it',
  '/o-firmie',
  '/kontakt',
  '/ksef',
  '/ulga-na-kase-fiskalna',
  '/automaty-vendingowe',
  '/agd-rtv-dla-firm',
  '/dostawy-it-dla-firm',
  '/zestawy',
  '/marki/posnet',
  '/marki/elzab',
  '/marki/lenovo',
  '/oferta/kasy-fiskalne',
  '/oferta/laptopy',
  '/oferta/drukarki-fiskalne',
]

export const THRESHOLD = 0.8

/** H2, sections and text length of `<main>` (the frame — header, footer — is the same code). */
export function measure(html) {
  const main = html.match(/<main[\s>][\s\S]*?<\/main>/)?.[0] ?? ''
  const text = main
    .replace(/<(script|style|template)[\s\S]*?<\/\1>/g, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&[a-z#0-9]+;/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim()
  return {
    h2: (main.match(/<h2[\s>]/g) ?? []).length,
    sections: (main.match(/<section[\s>]/g) ?? []).length,
    text: text.length,
  }
}

/** Metrics where B has less than `threshold` of A (an empty list = the same content). */
export function shortfalls(a, b, threshold = THRESHOLD) {
  return ['h2', 'sections', 'text'].filter((key) => a[key] > 0 && b[key] < a[key] * threshold)
}

function get(origin, path, auth, siteHost) {
  const target = new URL(path, origin)
  const local = target.hostname.endsWith('.localhost')
  const request = target.protocol === 'https:' ? httpsRequest : httpRequest
  return new Promise((resolve, reject) => {
    const req = request(
      {
        host: local ? '127.0.0.1' : target.hostname,
        port: target.port || (target.protocol === 'https:' ? 443 : 80),
        path: target.pathname + target.search,
        // SNI: the site's name, never an IP (a tunnel address).
        servername:
          siteHost?.split(':')[0] || (isIP(target.hostname) ? undefined : target.hostname),
        headers: {
          host: siteHost || target.host,
          ...(auth && { authorization: `Basic ${Buffer.from(auth).toString('base64')}` }),
        },
      },
      (res) => {
        let body = ''
        res.setEncoding('utf8')
        res.on('data', (chunk) => (body += chunk))
        res.on('end', () => resolve({ status: res.statusCode ?? 0, html: body }))
      },
    )
    req.setTimeout(120_000, () => req.destroy(new Error(`timeout ${target.href}`)))
    req.on('error', reject)
    req.end()
  })
}

/** `--widocznosc <origin>`: sections hidden after scrolling, per page and width. */
async function visibility(origin) {
  const { chromium } = await import('@playwright/test')
  const { hiddenAfterScroll, PAGES: VISIBLE_PAGES } = await import('./widocznosc.mjs')
  const auth = process.env.TRESC_AUTH?.split(':')
  const browser = await chromium.launch()
  let bad = 0
  for (const width of [1440, 390]) {
    for (const path of VISIBLE_PAGES) {
      const page = await browser.newPage({
        viewport: { width, height: width > 800 ? 900 : 844 },
        reducedMotion: 'no-preference',
        ...(auth && { httpCredentials: { username: auth[0], password: auth[1] } }),
      })
      const response = await page
        .goto(new URL(path, origin).href, { timeout: 180_000 })
        .catch((error) => ({ status: () => 0, error }))
      const status = response?.status() ?? 0
      const hidden = status === 200 ? await hiddenAfterScroll(page) : []
      await page.close()
      const result =
        status !== 200
          ? `HTTP ${status}`
          : hidden.map((h) => `${h.element} — ${h.why} — ${h.rule}`).join('; ') || 'ok'
      if (result !== 'ok') bad++
      console.log(`${path}	${width}	${result}`)
    }
  }
  await browser.close()
  console.log(`
Widoczność: ${bad ? `${bad} stron z problemem` : 'wszystkie sekcje widoczne'}`)
  process.exit(bad ? 1 : 0)
}

async function main([a, b] = process.argv.slice(2)) {
  if (a === '--widocznosc') {
    if (!b) {
      console.error('usage: node scripts/porownaj-tresc.mjs --widocznosc <adres>')
      process.exit(2)
    }
    return visibility(b)
  }
  if (!a || !b) {
    console.error('usage: node scripts/porownaj-tresc.mjs <adres A (wzór)> <adres B (sprawdzany)>')
    process.exit(2)
  }
  const rows = []
  for (const path of PAGES) {
    // A network error is a row of the table, not a crash: the other pages are still measured.
    const fetchOne = (origin, auth, host) =>
      get(origin, path, auth, host).catch((error) => ({ status: 0, html: '', error }))
    const ra = await fetchOne(a, process.env.TRESC_AUTH_A, process.env.TRESC_HOST_A)
    const rb = await fetchOne(b, process.env.TRESC_AUTH_B, process.env.TRESC_HOST_B)
    const ma = measure(ra.html)
    const mb = measure(rb.html)
    const problems = [
      ra.status !== 200 && `A: ${ra.error?.code ?? `HTTP ${ra.status}`}`,
      rb.status !== 200 && `B: ${rb.error?.code ?? `HTTP ${rb.status}`}`,
      ...shortfalls(ma, mb).map((key) => `${key} ${mb[key]}/${ma[key]}`),
    ].filter(Boolean)
    rows.push({ path, ma, mb, problems })
    process.stderr.write('.')
  }
  process.stderr.write('\n')
  console.log('strona\tH2 A/B\tsekcje A/B\ttekst A/B\twynik')
  for (const { path, ma, mb, problems } of rows) {
    console.log(
      `${path}\t${ma.h2}/${mb.h2}\t${ma.sections}/${mb.sections}\t${ma.text}/${mb.text}\t${problems.join(', ') || 'ok'}`,
    )
  }
  const bad = rows.filter((row) => row.problems.length)
  console.log(`\nStron: ${rows.length} · poniżej ${THRESHOLD * 100}% wzoru: ${bad.length}`)
  process.exit(bad.length ? 1 : 0)
}

if (process.argv[1] === fileURLToPath(import.meta.url)) await main()
