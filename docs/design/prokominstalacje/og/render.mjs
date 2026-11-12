// Renders the Instalacje OG image (1200 × 630) from og.html with Playwright's Chromium:
//   node docs/design/prokominstalacje/og/render.mjs
// Output: docs/design/prokominstalacje/og/og-prokominstalacje.png — upload it in the panel
// (SiteSettings of the Instalacje tenant → SEO → OG image), decision D6 = A.
import { dirname, join } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

import { chromium } from '@playwright/test'

const here = dirname(fileURLToPath(import.meta.url))
const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1200, height: 630 } })
await page.goto(pathToFileURL(join(here, 'og.html')).href)
await page.evaluate(() => document.fonts.ready)
await page.screenshot({ path: join(here, 'og-prokominstalacje.png'), type: 'png' })
await browser.close()
console.log('og-prokominstalacje.png')
