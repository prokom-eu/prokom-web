#!/usr/bin/env node
// BIZ-3 §11 (QA): every page type of prokombiznes.pl in 1440 and 390 px, light and dark theme —
// sideways scroll, white blocks in the dark theme, product photos without alt, one H1, console
// errors and axe (WCAG 2.1 AA, light 1440). Run against `pnpm build && pnpm start`:
//   node scripts/biznes-qa.mjs [origin] [--json]
// origin defaults to http://biznes.localhost:$PORT (3001). `*.localhost` resolves to 127.0.0.1
// in Chromium; the dev server works too, only slower.
import AxeBuilder from '@axe-core/playwright'
import { chromium } from '@playwright/test'

const args = process.argv.slice(2)
const origin =
  args.find((arg) => arg.startsWith('http')) ??
  `http://biznes.localhost:${process.env.PORT ?? 3001}`
const json = args.includes('--json')

// One page of each type (plan 0611 §11: all page types), the Lighthouse nine among them.
const PAGES = [
  '/',
  '/oferta',
  '/oferta/kasy-fiskalne',
  '/oferta/laptopy',
  '/oferta/drukarki-wielofunkcyjne/laser-kolor',
  '/produkt/posnet-ergo-online',
  '/produkt/lenovo-thinkbook-14-g8-g9',
  '/marki',
  '/marki/apple',
  '/marki/posnet',
  '/marki/dibal',
  '/zestawy',
  '/zestawy/zestaw-biuro-3-5',
  '/branze/gastronomia',
  '/plan-firmy',
  '/konfigurator',
  '/zapytanie',
  '/gopos',
  '/insert',
  '/opieka-it',
  '/ksef',
  '/ulga-na-kase-fiskalna',
  '/automaty-vendingowe',
  '/agd-rtv-dla-firm',
  '/dostawy-it-dla-firm',
  '/kontakt',
  '/o-firmie',
  '/aktualnosci',
  '/mapa-strony',
  '/polityka-prywatnosci',
]
const VIEWS = [
  { width: 1440, height: 900, theme: 'light' },
  { width: 390, height: 844, theme: 'light' },
  { width: 1440, height: 900, theme: 'dark' },
  { width: 390, height: 844, theme: 'dark' },
]

const browser = await chromium.launch()
const rows = []
for (const view of VIEWS) {
  const context = await browser.newContext({
    viewport: { width: view.width, height: view.height },
    reducedMotion: 'reduce',
  })
  await context.addInitScript((theme) => {
    try {
      localStorage.setItem('pk-theme', theme)
    } catch {}
  }, view.theme)
  const page = await context.newPage()
  for (const path of PAGES) {
    const errors = []
    const onError = (message) => {
      if (message.type() === 'error') errors.push(message.text().slice(0, 140))
    }
    page.on('console', onError)
    const response = await page.goto(origin + path, { waitUntil: 'networkidle', timeout: 90_000 })
    const result = await page.evaluate((dark) => {
      const doc = document.documentElement
      const main = document.querySelector('main') ?? document.body
      const photos = [
        ...main.querySelectorAll('img[src*="/api/media"], img[srcset*="api%2Fmedia"]'),
      ]
      const white = dark
        ? [...main.querySelectorAll('*')].filter((element) => {
            if (getComputedStyle(element).backgroundColor !== 'rgb(255, 255, 255)') return false
            const box = element.getBoundingClientRect()
            return box.width * box.height > 40_000
          }).length
        : 0
      return {
        overflow: doc.scrollWidth - doc.clientWidth,
        height: Math.round(main.getBoundingClientRect().height),
        h1: document.querySelectorAll('h1').length,
        emptyAlt: photos.filter(
          (image) => !image.alt.trim() && !image.closest('.pointer-events-none, [aria-hidden]'),
        ).length,
        white,
      }
    }, view.theme === 'dark')
    let axe = null
    if (view.width === 1440 && view.theme === 'light') {
      const report = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
        .analyze()
      axe = report.violations.map((violation) => `${violation.id}×${violation.nodes.length}`)
    }
    page.off('console', onError)
    rows.push({
      path,
      view: `${view.width} ${view.theme}`,
      status: response?.status() ?? 0,
      ...result,
      errors: errors.length,
      firstError: errors[0] ?? null,
      axe,
    })
    process.stderr.write(`\r${rows.length}/${PAGES.length * VIEWS.length}`)
  }
  await context.close()
}
await browser.close()
process.stderr.write('\n')

if (json) {
  console.log(JSON.stringify(rows, null, 2))
} else {
  for (const row of rows) {
    const problems = [
      row.status !== 200 && `HTTP ${row.status}`,
      row.overflow > 0 && `przewijanie w bok ${row.overflow}px`,
      row.h1 !== 1 && `H1×${row.h1}`,
      row.emptyAlt > 0 && `puste alt ×${row.emptyAlt}`,
      row.white > 0 && `białe bloki ×${row.white}`,
      row.errors > 0 && `błędy konsoli ×${row.errors}`,
      row.axe?.length && `axe: ${row.axe.join(', ')}`,
    ].filter(Boolean)
    console.log(`${row.path}\t${row.view}\t${row.height}px\t${problems.join('; ') || 'ok'}`)
  }
}
