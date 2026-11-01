// Audyt telefonu (I14): każda strona linii × 360/390/414 × jasny/ciemny — te same kontrole co
// tests/e2e/instalacje/telefon.e2e.spec.ts (wspólny phone-audit.ts), ale jeden przebieg na
// działającym `pnpm dev`, bez test runnera. Wynik: tmp/audyt-telefon/raport.md (tabela strona ×
// szerokość + lista problemów) i zrzuty ekranu 390×844 w obu motywach.
// Użycie (dev server Instalacji musi działać, Node 24 — uruchamia .ts bez kompilacji):
//   node docs/design/prokominstalacje/narzedzia/audyt-telefon.mjs            wszystkie strony
//   node docs/design/prokominstalacje/narzedzia/audyt-telefon.mjs /anteny /  wybrane adresy
//   … --bez-zrzutow                                                          bez PNG
// Adres bazowy: INST_URL (domyślnie http://instalacje.localhost:3002).
import { chromium } from '@playwright/test'
import { mkdirSync, writeFileSync } from 'node:fs'
import { join, resolve } from 'node:path'

import { INST_PAGES } from '../../../../tests/e2e/instalacje/pages.ts'
import {
  auditPhone,
  FAILING,
  PHONE_WIDTHS,
  setTheme,
  THEMES,
} from '../../../../tests/e2e/instalacje/phone-audit.ts'

const args = process.argv.slice(2)
const shots = !args.includes('--bez-zrzutow')
const pages = args.filter((a) => a.startsWith('/'))
const list = pages.length ? pages : INST_PAGES
const BASE = process.env.INST_URL || 'http://instalacje.localhost:3002'
const OUT = resolve('tmp/audyt-telefon')
mkdirSync(OUT, { recursive: true })

const browser = await chromium.launch()
const context = await browser.newContext({
  viewport: { width: PHONE_WIDTHS[0], height: 844 },
  deviceScaleFactor: 2,
  isMobile: true,
  hasTouch: true,
  reducedMotion: 'reduce',
})
const rows = []
const details = []
for (const path of list) {
  const page = await context.newPage()
  const response = await page.goto(BASE + path, { waitUntil: 'load' })
  const cells = {}
  if (response?.status() !== 200) {
    for (const w of PHONE_WIDTHS) cells[w] = `HTTP ${response?.status()}`
  } else {
    await page.waitForTimeout(800)
    for (const width of PHONE_WIDTHS) {
      await page.setViewportSize({ width, height: 844 })
      const found = new Map()
      for (const theme of THEMES) {
        await setTheme(page, theme)
        for (const p of await auditPhone(page, width)) {
          const key = `${p.kind}: ${p.detail}`
          found.set(key, [...(found.get(key) ?? []), theme])
        }
        if (shots && width === 390) {
          const name = path === '/' ? 'start' : path.slice(1).replaceAll('/', '_')
          await page.screenshot({ path: join(OUT, `${name}-390-${theme}.png`) })
        }
      }
      const fails = [...found.keys()].filter((k) => FAILING.has(k.split(':')[0]))
      const notes = found.size - fails.length
      cells[width] = fails.length ? `✗ ${fails.length}` : notes ? `✓ (${notes} uw.)` : '✓'
      for (const [key, themes] of found) {
        const both = themes.length === THEMES.length ? '' : ` [${themes.join(', ')}]`
        details.push(`| \`${path}\` | ${width} | ${key.replaceAll('|', '/')}${both} |`)
      }
    }
  }
  rows.push(`| \`${path}\` | ${PHONE_WIDTHS.map((w) => cells[w]).join(' | ')} |`)
  console.log(path, PHONE_WIDTHS.map((w) => cells[w]).join(' · '))
  await page.close()
}
await browser.close()

const report = `# Audyt telefonu — Instalacje (${new Date().toISOString().slice(0, 10)})

Kontrole: tests/e2e/instalacje/phone-audit.ts (MOBILE-APLIKACJA §10), oba motywy w każdej komórce.
✗ = problemy blokujące (przewijanie w bok, cele dotykowe, formularze, nagłówek, pasek kotwic,
dolny pasek, sekcje zwinięte); „uw.” = uwagi (karuzele bez przyciągania).

| Strona | ${PHONE_WIDTHS.join(' px | ')} px |
|---|${PHONE_WIDTHS.map(() => '---').join('|')}|
${rows.join('\n')}

## Szczegóły

| Strona | px | Problem [tylko motyw] |
|---|---|---|
${details.join('\n')}
`
writeFileSync(join(OUT, 'raport.md'), report)
console.log(`raport: tmp/audyt-telefon/raport.md (${list.length} stron)`)
