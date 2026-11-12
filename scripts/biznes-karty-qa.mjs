// Product cards checked one by one before production (PRODUKCJA-BIZNES-1211 sesja 5, pkt 3):
// gallery, parameters, versions, description, FAQ, „Do tego zwykle dobierają”, sources with
// a date and the inquiry button — at 1440 and 390, from what the browser renders.
//   node scripts/biznes-karty-qa.mjs [origin] [--slugs=a,b] [--json]
// Default: 2+ cards of every catalog category (the plan's list first). Exit 1 on a card below
// the thresholds; the table goes to stdout (Markdown) for docs/design/prokombiznes/0611/QA-PRODUKCJA.md.
import { chromium } from '@playwright/test'

try {
  process.loadEnvFile('.env')
} catch {
  // No .env: origin argument or the default port.
}

const args = process.argv.slice(2)
const option = (name) => args.find((arg) => arg.startsWith(`--${name}=`))?.split('=')[1]
const origin =
  args.find((arg) => !arg.startsWith('--')) || `http://biznes.localhost:${process.env.PORT || 3001}`

/** The plan's cards first, then 2+ per category (slugs of the database). */
export const CARDS = [
  'posnet-ergo-online',
  'elzab-k10-online',
  'sunmi-d3-pro',
  'polcard-move-3500',
  'lenovo-thinkbook-14-g8-g9',
  'dell-pro-14-16',
  'kyocera-taskalfa-2320-2020',
  'brother-mfc-l2922dw-mfc-l2862dw',
  'synology-diskstation-plus-2-4',
  'ubiquiti-unifi-u7-pro',
  'comex-cover-core-one',
  'fellowes-lx210',
  'optivendi-winda-2026',
  'insert-subiekt-nexo',
  'm365-business-standard',
  'przeglad-it',
  'posnet-thermal-hd-online',
  'elzab-zeta-online',
  'polcard-axium-dx-8000',
  'dibal-dmi-610',
  'zebra-tc22-tc27',
  'lenovo-thinkcentre-neo-50t',
  'dell-pro-monitor',
  'logitech-mx-keys-for-business',
  'hp-laserjet-pro-mfp-3102fdw',
  'omada-routery',
  'apc-back-ups-pro',
  'kobra-240-1-c2-es',
  'avtek-ts-9-lite-g',
  'eset-pakiet-complete',
  'eurocert-ecsigner-online',
  'gopos',
]

const slugs = option('slugs')?.split(',') ?? CARDS

function check() {
  const main = document.querySelector('main')
  const text = (selector) => main?.querySelector(selector)?.textContent?.trim() ?? ''
  const count = (selector) => main?.querySelectorAll(selector).length ?? 0
  const about = main?.querySelector('#opis')
  return {
    h1: text('h1'),
    photos: Math.max(
      count('[data-gallery-open]') > 0 ? 1 : 0,
      count('ul[aria-label="Zdjęcia"] li'),
    ),
    zoom: count('[data-gallery-open]') > 0,
    params: count('#parametry dt, #parametry th[scope="row"], #parametry li'),
    versions: count('#wersje li, #wersje tbody tr'),
    description: (about?.textContent ?? '').replace(/\s+/g, ' ').trim().length,
    faq: count('#faq details'),
    suggestions: count('#dobierz li'),
    sources: count('#zrodla li'),
    sourceDate: /sprawdzono \d{2}\.\d{2}\.\d{4}/.test(text('#zrodla')),
    ask: [...(main?.querySelectorAll('button, a') ?? [])].some((el) =>
      /do zapytania|zapytaj/i.test(el.textContent ?? ''),
    ),
    sideways: document.documentElement.scrollWidth > window.innerWidth + 1,
  }
}

const browser = await chromium.launch()
const rows = []
for (const slug of slugs) {
  for (const width of [1440, 390]) {
    const page = await browser.newPage({ viewport: { width, height: width > 800 ? 900 : 844 } })
    const response = await page
      .goto(`${origin}/produkt/${slug}`, { timeout: 120_000 })
      .catch(() => null)
    const status = response?.status() ?? 0
    const result = status === 200 ? await page.evaluate(check) : null
    await page.close()
    const problems = !result
      ? [`HTTP ${status}`]
      : [
          result.description < 1000 && `opis ${result.description}`,
          result.faq > 0 && result.faq < 4 && `FAQ ${result.faq}`,
          result.suggestions > 0 && result.suggestions < 3 && `dobierają ${result.suggestions}`,
          result.sources > 0 && !result.sourceDate && 'źródła bez daty',
          !result.ask && 'brak przycisku zapytania',
          result.sideways && 'przewijanie w bok',
        ].filter(Boolean)
    rows.push({ slug, width, status, ...(result ?? {}), problems })
    process.stderr.write(problems.length ? 'x' : '.')
  }
}
await browser.close()
process.stderr.write('\n')

if (args.includes('--json')) {
  console.log(JSON.stringify(rows, null, 2))
} else {
  console.log(
    '| karta | szer. | zdjęcia | parametry | wersje | opis | FAQ | dobierają | źródła (data) | uwagi |',
  )
  console.log('|---|---|---|---|---|---|---|---|---|---|')
  for (const r of rows) {
    console.log(
      `| \`${r.slug}\` | ${r.width} | ${r.photos ?? '—'} | ${r.params ?? '—'} | ${r.versions ?? '—'} | ${r.description ?? '—'} | ${r.faq ?? '—'} | ${r.suggestions ?? '—'} | ${r.sources ?? '—'}${r.sourceDate ? ' ✓' : ''} | ${r.problems.join(', ') || 'ok'} |`,
    )
  }
}
process.exit(rows.some((row) => row.problems.length) ? 1 : 0)
