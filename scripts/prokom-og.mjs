// Open Graph image of pro-kom.eu (audit H8 P1 pkt 2): 1200×630 PNG on the hub's dark surface with
// the logo, the hero line and the five line colours, for link previews.
//   node scripts/prokom-og.mjs     rewrites public/brand/prokom-glowna_og.png
// Like `software-og.mjs`: colours from src/styles/tokens*.css, the logo from public/brand, the
// brand fonts from src/app/(sites)/fonts, Playwright draws the page. Run it again when the logo,
// the palette or the hero line changes; the panel's „Obraz OG” (SiteSettings) overrides the file.
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

import { chromium } from '@playwright/test'

const root = new URL('../', import.meta.url)
const read = (path, encoding) => readFileSync(fileURLToPath(new URL(path, root)), encoding)

/** Value of a `--name: #rrggbb;` token (the first one in the file). */
function token(css, name) {
  const match = css.match(new RegExp(`--${name}:\\s*(#[0-9a-fA-F]{3,8})\\s*;`))
  if (!match) throw new Error(`Token --${name} not found`)
  return match[1]
}

const base = read('src/styles/tokens.css', 'utf8')
// The dark block of the hub (default theme) — its values override the light base rule.
const hub =
  read('src/styles/tokens-prokom.css', 'utf8').split(
    "[data-line='prokom'][data-theme='dark'] {",
  )[1] ?? ''
const color = {
  surface: token(hub, 'surface'),
  surface3: token(hub, 'surface-3'),
  ink: token(hub, 'ink'),
  ink2: token(hub, 'ink-2'),
  accent: token(hub, 'accent-text'),
  lines: ['prokom', 'biznes', 'instalacje', 'software', 'tech'].map((line) =>
    token(base, `c-${line}-on-dark`),
  ),
  gaming: token(base, 'gaming-gold'),
}
const font = (file) =>
  `data:font/woff2;base64,${read(`src/app/(sites)/fonts/${file}`).toString('base64')}`
const logo = `data:image/svg+xml;base64,${read('public/brand/prokom-glowna_poziome_negatyw.svg').toString('base64')}`
const band = [...color.lines.slice(1), color.gaming].map((c) => `<i style="background:${c}"></i>`)

const html = `<!doctype html>
<html lang="pl"><head><meta charset="utf-8"><style>
@font-face { font-family: Archivo; src: url(${font('archivo-latin-wdth-normal.woff2')}) format('woff2'); font-weight: 100 900; font-stretch: 62% 125%; }
@font-face { font-family: Archivo; src: url(${font('archivo-latin-ext-wdth-normal.woff2')}) format('woff2'); font-weight: 100 900; font-stretch: 62% 125%; unicode-range: U+0100-024F; }
@font-face { font-family: Manrope; src: url(${font('manrope-latin-wght-normal.woff2')}) format('woff2'); font-weight: 200 800; }
@font-face { font-family: Manrope; src: url(${font('manrope-latin-ext-wght-normal.woff2')}) format('woff2'); font-weight: 200 800; unicode-range: U+0100-024F; }
* { margin: 0; box-sizing: border-box; }
body { width: 1200px; height: 630px; background: ${color.surface}; color: ${color.ink};
  font-family: Manrope, sans-serif; position: relative; overflow: hidden; }
.band { position: absolute; inset: auto 0 0 0; height: 14px; display: flex; }
.band i { flex: 1; }
.ring { position: absolute; right: -170px; top: -170px; width: 560px; height: 560px;
  border-radius: 50%; background: ${color.surface3}; }
main { position: relative; padding: 118px 88px 0; }
img { height: 60px; display: block; }
h1 { margin-top: 88px; font-family: Archivo, sans-serif; font-weight: 800; font-size: 68px;
  line-height: 1.04; letter-spacing: -0.02em; max-width: 960px; }
h1 span { display: block; color: ${color.accent}; }
p { margin-top: 30px; font-size: 30px; font-weight: 600; color: ${color.ink2}; }
</style></head><body>
<div class="ring"></div>
<main>
  <img src="${logo}" alt="PRO-KOM">
  <h1>Sprzęt, instalacje, oprogramowanie i serwis.<span>W jednej firmie.</span></h1>
  <p>pro-kom.eu · Rabka-Zdrój</p>
</main>
<div class="band">${band.join('')}</div>
</body></html>`

const browser = await chromium.launch()
try {
  const page = await browser.newPage({ viewport: { width: 1200, height: 630 } })
  await page.setContent(html)
  await page.evaluate(() => document.fonts.ready)
  const out = fileURLToPath(new URL('public/brand/prokom-glowna_og.png', root))
  await page.screenshot({ path: out, type: 'png' })
  console.log(`Saved ${out}`)
} finally {
  await browser.close()
}
