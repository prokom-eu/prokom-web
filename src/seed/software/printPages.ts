import { notFoundSchema, thanksSchema } from '../../lib/software/pages'

import { SOFTWARE_LEGAL_PAGES } from './legal'
import { SOFTWARE_NOT_FOUND, SOFTWARE_THANKS } from './pages'

/**
 * `pnpm software:pages-json`: the values of `SoftwareSettings.thanks` and `.notFound` (texts of
 * `/dziekujemy` and the 404, SW11b), to paste in the panel where the seed is blocked (staging,
 * production), and the four legal pages (SWA6a) as bodies for `POST /api/pages` — their tables
 * live inside the text, which the panel cannot take as pasted JSON. `tenant` is left for the
 * Software tenant id of that database. Checked against the schemas the panel uses on save.
 */
const thanks = thanksSchema.safeParse(SOFTWARE_THANKS)
const notFound = notFoundSchema.safeParse(SOFTWARE_NOT_FOUND)
if (!thanks.success || !notFound.success) {
  console.error((thanks.error ?? notFound.error)?.issues[0])
  process.exit(1)
}
const legalPages = SOFTWARE_LEGAL_PAGES.map((page) => ({
  tenant: '<id tenanta Software>',
  title: page.title,
  slug: page.slug,
  layout: page.layout(),
  _status: 'published',
}))
process.stdout.write(
  `${JSON.stringify({ thanks: SOFTWARE_THANKS, notFound: SOFTWARE_NOT_FOUND, legalPages }, null, 2)}\n`,
)
process.exit(0)
