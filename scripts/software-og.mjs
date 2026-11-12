// Open Graph image of prokomsoftware.pl (SWV8 P0 #4): 1200×630 PNG on papier with the logo and
// the hero line, for link previews (Facebook, WhatsApp, LinkedIn).
//   node scripts/software-og.mjs     rewrites public/brand/prokom-software_og.png
// Colours from src/styles/tokens.css (Software light palette), the logo from public/brand, the
// brand fonts from src/app/(sites)/fonts — nothing new to install: Playwright draws the page
// (`next/og` would need TTF fonts, the repo has woff2 only). Run it again when the logo, the
// palette or the hero line changes; the panel's „Obraz OG” (SiteSettings) overrides the file.
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

import { chromium } from '@playwright/test'

const root = new URL('../', import.meta.url)
const read = (path, encoding) => readFileSync(fileURLToPath(new URL(path, root)), encoding)

/** Value of a `--name: #rrggbb;` token in tokens.css. */
function token(css, name) {
  const match = css.match(new RegExp(`--${name}:\\s*(#[0-9a-fA-F]{3,8})\\s*;`))
  if (!match) throw new Error(`Token --${name} not found in tokens.css`)
  return match[1]
}

const tokens = read('src/styles/tokens.css', 'utf8')
const color = {
  surface: token(tokens, 'c-software-light-surface'),
  surface2: token(tokens, 'c-software-light-surface-2'),
  ink: token(tokens, 'c-software-light-ink'),
  ink2: token(tokens, 'c-software-light-ink-2'),
  accent: token(tokens, 'c-software-light-accent'),
  accentText: token(tokens, 'c-software-light-accent-text'),
}
const font = (file) =>
  `data:font/woff2;base64,${read(`src/app/(sites)/fonts/${file}`).toString('base64')}`
const logo = `data:image/svg+xml;base64,${read('public/brand/prokom-software_poziome_kolor.svg').toString('base64')}`

const html = `<!doctype html>
<html lang="pl"><head><meta charset="utf-8"><style>
@font-face { font-family: Archivo; src: url(${font('archivo-latin-wdth-normal.woff2')}) format('woff2'); font-weight: 100 900; font-stretch: 62% 125%; }
@font-face { font-family: Archivo; src: url(${font('archivo-latin-ext-wdth-normal.woff2')}) format('woff2'); font-weight: 100 900; font-stretch: 62% 125%; unicode-range: U+0100-024F; }
@font-face { font-family: Manrope; src: url(${font('manrope-latin-wght-normal.woff2')}) format('woff2'); font-weight: 200 800; }
@font-face { font-family: Manrope; src: url(${font('manrope-latin-ext-wght-normal.woff2')}) format('woff2'); font-weight: 200 800; unicode-range: U+0100-024F; }
* { margin: 0; box-sizing: border-box; }
body { width: 1200px; height: 630px; background: ${color.surface}; color: ${color.ink};
  font-family: Manrope, sans-serif; position: relative; overflow: hidden; }
.band { position: absolute; inset: auto 0 0 0; height: 14px; background: ${color.accent}; }
.ring { position: absolute; right: -170px; top: -170px; width: 560px; height: 560px;
  border-radius: 50%; background: ${color.surface2}; }
main { position: relative; padding: 118px 88px 0; }
img { height: 64px; display: block; }
h1 { margin-top: 92px; font-family: Archivo, sans-serif; font-weight: 800; font-size: 72px;
  line-height: 1.02; letter-spacing: -0.02em; }
h1 span { display: block; color: ${color.accentText}; }
p { margin-top: 30px; font-size: 30px; font-weight: 600; color: ${color.ink2}; }
</style></head><body>
<div class="ring"></div>
<main>
  <img src="${logo}" alt="PRO-KOM Software">
  <h1>Strony i programy dla firm.<span>Zobaczysz, zanim zapłacisz.</span></h1>
  <p>prokomsoftware.pl · Rabka-Zdrój</p>
</main>
<div class="band"></div>
</body></html>`

const browser = await chromium.launch()
try {
  const page = await browser.newPage({ viewport: { width: 1200, height: 630 } })
  await page.setContent(html)
  await page.evaluate(() => document.fonts.ready)
  const out = fileURLToPath(new URL('public/brand/prokom-software_og.png', root))
  await page.screenshot({ path: out, type: 'png' })
  console.log(`Saved ${out}`)
} finally {
  await browser.close()
}
