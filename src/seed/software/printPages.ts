import { notFoundSchema, thanksSchema } from '../../lib/software/pages'

import { SOFTWARE_NOT_FOUND, SOFTWARE_THANKS } from './pages'

/**
 * `pnpm software:pages-json`: the values of `SoftwareSettings.thanks` and `.notFound` (texts of
 * `/dziekujemy` and the 404, SW11b), to paste in the panel where the seed is blocked (staging,
 * production). Checked against the schemas the panel uses on save; prints nothing else.
 */
const thanks = thanksSchema.safeParse(SOFTWARE_THANKS)
const notFound = notFoundSchema.safeParse(SOFTWARE_NOT_FOUND)
if (!thanks.success || !notFound.success) {
  console.error((thanks.error ?? notFound.error)?.issues[0])
  process.exit(1)
}
process.stdout.write(
  `${JSON.stringify({ thanks: SOFTWARE_THANKS, notFound: SOFTWARE_NOT_FOUND }, null, 2)}\n`,
)
process.exit(0)
