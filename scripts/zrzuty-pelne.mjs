// Full-page screenshots of prokombiznes.pl as a visitor sees them (PRODUKCJA-BIZNES-1211 P0):
// motion on, scrolled like a visitor (scripts/widocznosc.mjs), nothing forced visible — a section that never rises
// in is an empty area in the picture. Required before every PR with UI (docs/jakosc.md).
//   node scripts/zrzuty-pelne.mjs                                  biznes.localhost:<PORT>, 1440+390, light+dark
//   node scripts/zrzuty-pelne.mjs http://biznes.localhost:3001 --widths=1440 --themes=light
//   node scripts/zrzuty-pelne.mjs <origin> --pages=/gopos,/insert
// Result: tmp/zrzuty-pelne/<page>-<width>-<theme>.png and tmp/zrzuty-pelne/index.html (thumbnails
// linking to the full shot). Sections still hidden after scrolling are listed under each shot.
// ZRZUTY_AUTH=user:password for a site behind a login (staging).
import { mkdirSync, writeFileSync } from 'node:fs'
import { join, resolve } from 'node:path'

import { chromium } from '@playwright/test'

import { hiddenAfterScroll, PAGES } from './widocznosc.mjs'

try {
  process.loadEnvFile('.env')
} catch {
  // No .env: an origin argument or the default port.
}

const args = process.argv.slice(2)
const option = (name) => args.find((arg) => arg.startsWith(`--${name}=`))?.split('=')[1]
const origin =
  args.find((arg) => !arg.startsWith('--')) || `http://biznes.localhost:${process.env.PORT || 3000}`
const widths = (option('widths') || '1440,390').split(',').map(Number)
const themes = (option('themes') || 'light,dark').split(',')
const pages = option('pages')?.split(',') ?? PAGES
const OUT = resolve('tmp/zrzuty-pelne')
const auth = process.env.ZRZUTY_AUTH?.split(':')

const fileName = (path, width, theme) =>
  `${path === '/' ? 'glowna' : path.slice(1).replaceAll('/', '_')}-${width}-${theme}.png`

mkdirSync(OUT, { recursive: true })
const browser = await chromium.launch()
const rows = []

for (const path of pages) {
  for (const width of widths) {
    for (const theme of themes) {
      const page = await browser.newPage({
        viewport: { width, height: width > 800 ? 900 : 844 },
        deviceScaleFactor: 1,
        reducedMotion: 'no-preference',
        ...(auth && { httpCredentials: { username: auth[0], password: auth[1] } }),
      })
      await page.addInitScript((value) => {
        try {
          localStorage.setItem('pk-theme', value)
        } catch {}
      }, theme)
      const file = fileName(path, width, theme)
      try {
        const response = await page.goto(origin + path, { timeout: 180_000 })
        const hidden = await hiddenAfterScroll(page)
        await page.screenshot({ path: join(OUT, file), fullPage: true })
        rows.push({ path, width, theme, file, status: response?.status() ?? 0, hidden })
        console.log(`${file}${hidden.length ? `  NIEWIDOCZNE: ${hidden.length}` : ''}`)
      } catch (error) {
        rows.push({ path, width, theme, file: null, status: 0, hidden: [], error: String(error) })
        console.log(`${file}  BŁĄD: ${error}`)
      }
      await page.close()
    }
  }
}
await browser.close()

const escape = (text) => text.replace(/[&<>"]/g, (c) => `&#${c.charCodeAt(0)};`)
const html = `<!doctype html><meta charset="utf-8"><title>Zrzuty pełne — prokombiznes.pl</title>
<style>body{font:14px system-ui;margin:24px;background:#f4f5f7;color:#111}
.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:16px}
figure{margin:0;background:#fff;padding:8px;border:1px solid #ddd}
img{width:100%;height:420px;object-fit:cover;object-position:top}
figcaption{font-weight:600;margin:0 0 6px}.bad{color:#b00020}ul{margin:6px 0 0;padding-left:18px}</style>
<h1>Zrzuty pełne — ${escape(origin)}</h1>
<p>Przewijanie jak użytkownik, ruch włączony, nic nie wymuszone. Niewidocznych: ${rows.reduce((n, r) => n + r.hidden.length, 0)}.</p>
<div class="grid">${rows
  .map(
    (
      row,
    ) => `<figure><figcaption>${escape(row.path)} · ${row.width} · ${row.theme}${row.status !== 200 ? ` <span class="bad">HTTP ${row.status}</span>` : ''}</figcaption>
${row.file ? `<a href="${row.file}"><img loading="lazy" src="${row.file}" alt=""></a>` : `<p class="bad">${escape(row.error ?? '')}</p>`}
${row.hidden.length ? `<ul class="bad">${row.hidden.map((h) => `<li>${escape(`${h.element} — ${h.why}`)}</li>`).join('')}</ul>` : ''}</figure>`,
  )
  .join('\n')}</div>`
writeFileSync(join(OUT, 'index.html'), html)
console.log(`\nGotowe: ${join(OUT, 'index.html')}`)
process.exit(rows.some((row) => row.hidden.length || row.status !== 200) ? 1 : 0)
