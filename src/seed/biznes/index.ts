/**
 * `pnpm seed:biznes` — only the Biznes catalog (`pnpm seed` runs it too). Local only, like the
 * main seed; needs the tenants of `pnpm seed` and an up-to-date schema (`pnpm payload migrate`).
 */
import { getPayload } from 'payload'

import config from '../../payload.config'
import { assertSeedAllowed } from '../config'
import { seedBiznesCatalog } from './run'

assertSeedAllowed(process.env.NODE_ENV)

const payload = await getPayload({ config })
try {
  await seedBiznesCatalog(payload)
} finally {
  await payload.destroy()
}
