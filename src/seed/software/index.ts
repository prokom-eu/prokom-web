/**
 * `pnpm seed:software` — only the Software package (`pnpm seed` runs it too). Local only, like
 * the main seed; needs the tenants of `pnpm seed` and an up-to-date schema (`pnpm payload migrate`).
 */
import { getPayload } from 'payload'

import config from '../../payload.config'
import { assertSeedAllowed } from '../config'
import { seedSoftware } from './run'

assertSeedAllowed(process.env.NODE_ENV)

const payload = await getPayload({ config })
try {
  await seedSoftware(payload)
} finally {
  await payload.destroy()
}
