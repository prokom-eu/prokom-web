// Software v24: screenshots of the code next to the pattern (PRZEKAZANIE-v24 §4, SWA1b).
// Usage (the Software dev server must run; port from PORT in .env, or SW_URL):
//   node scripts/software-porownaj.mjs                      every page, 1440/1280/834/390, dark + light
//   node scripts/software-porownaj.mjs Glowna Oferta        only these pages
//   SW_WIDTHS=1440,390 SW_THEMES=dark node scripts/software-porownaj.mjs Glowna
// Result: tmp/zrzuty-v24/<Page>-<width>-<theme>.png and tmp/zrzuty-v24/index.html — each shot next to
// its pattern from docs/design/prokomsoftware/v24/screens (when there is one), for the PR's list of
// „oczekiwane różnice”. Motion is reduced (autoplay stopped), so two runs give the same picture.
import { existsSync, mkdirSync, writeFileSync } from 'node:fs'
import { join, relative, resolve } from 'node:path'

import { chromium } from '@playwright/test'

try {
  process.loadEnvFile('.env')
} catch {
  // No .env: SW_URL or the default port.
}

const BASE = process.env.SW_URL || `http://software.localhost:${process.env.PORT || 3000}`
const WIDTHS = (process.env.SW_WIDTHS || '1440,1280,834,390').split(',').map(Number)
const THEMES = (process.env.SW_THEMES || 'dark,light').split(',')
const OUT = resolve('tmp/zrzuty-v24')
const PATTERN = resolve('docs/design/prokomsoftware/v24/screens')

/** Page name (= the pattern's file name) → address on the Software site. */
const PAGES = {
  Glowna: '/',
  Oferta: '/rozwiazania',
  Kreator: '/dobierz',
  Audyt: '/audyt',
  OFirmie: '/o-firmie',
  Kontakt: '/kontakt',
  Aktualnosci: '/aktualnosci',
  Polityka: '/polityka-prywatnosci',
  Regulamin: '/regulamin',
  Cookies: '/cookies',
  Dostepnosc: '/dostepnosc',
  MapaStrony: '/mapa-strony',
  Dziekujemy: '/dziekujemy',
  NieZnaleziono: '/tej-strony-nie-ma',
  Podglad: '/_software',
}

const chosen = process.argv.slice(2)
const unknown = chosen.filter((name) => !(name in PAGES))
if (unknown.length) {
  console.error(
    `Nieznane strony: ${unknown.join(', ')}. Dostępne: ${Object.keys(PAGES).join(', ')}`,
  )
  process.exit(1)
}
const pages = chosen.length ? chosen : Object.keys(PAGES)

mkdirSync(OUT, { recursive: true })
const browser = await chromium.launch()
const rows = []

for (const name of pages) {
  for (const width of WIDTHS) {
    for (const theme of THEMES) {
      const page = await browser.newPage({
        viewport: { width, height: width > 800 ? 900 : 844 },
        deviceScaleFactor: width > 800 ? 1 : 2,
        reducedMotion: 'reduce',
      })
      await page.addInitScript((value) => {
        try {
          localStorage.setItem('pk-theme', value)
        } catch {}
      }, theme)
      const url = BASE + PAGES[name]
      await page.goto(url, { waitUntil: 'networkidle' }).catch(() => page.goto(url))
      // Lazy parts (ADR-023) and images come in while the page is scrolled once.
      const height = await page.evaluate(() => document.documentElement.scrollHeight)
      for (let y = 0; y < height; y += 700) {
        await page.evaluate((top) => window.scrollTo(0, top), y)
        await page.waitForTimeout(80)
      }
      await page.evaluate(() => window.scrollTo(0, 0))
      await page.waitForTimeout(400)
      const file = `${name}-${width}-${theme}.png`
      await page.screenshot({ path: join(OUT, file), fullPage: true, animations: 'disabled' })
      await page.close()
      const pattern = join(PATTERN, `${name}-${width}-${theme}.jpg`)
      rows.push({ name, width, theme, file, pattern: existsSync(pattern) ? pattern : null })
      console.log(`${file}${existsSync(pattern) ? '' : '  (bez wzorca)'}`)
    }
  }
}
await browser.close()

const cell = (src, label) =>
  src
    ? `<figure><figcaption>${label}</figcaption><img loading="lazy" src="${src}"></figure>`
    : `<figure><figcaption>${label}</figcaption><p>brak wzorca w tej szerokości</p></figure>`
const html = `<!doctype html><meta charset="utf-8"><title>Software v24 — porównanie</title>
<style>body{font:14px system-ui;margin:24px;background:#111;color:#eee}section{margin:0 0 48px}
h2{font-size:16px}.pair{display:grid;grid-template-columns:1fr 1fr;gap:16px;align-items:start}
img{width:100%;border:1px solid #333}figcaption{margin:0 0 6px;color:#aaa}</style>
<h1>Software v24 — kod (lewo) i wzorzec (prawo)</h1>
${rows
  .map(
    (row) => `<section><h2>${row.name} · ${row.width} · ${row.theme}</h2><div class="pair">
${cell(row.file, 'KOD')}${cell(row.pattern && relative(OUT, row.pattern).replaceAll('\\', '/'), 'WZORZEC')}</div></section>`,
  )
  .join('\n')}`
writeFileSync(join(OUT, 'index.html'), html)
console.log(`\nGotowe: ${join(OUT, 'index.html')}`)
