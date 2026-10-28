/**
 * `pnpm seed:instalacje` — only the Instalacje package (`pnpm seed` runs it too). Local only, like
 * the main seed; needs the tenants of `pnpm seed` and an up-to-date schema (`pnpm payload migrate`).
 */
import { getPayload } from 'payload'

import config from '../../payload.config'
import { assertSeedAllowed } from '../config'
import { seedInstalacje } from './run'

assertSeedAllowed(process.env.NODE_ENV)

const payload = await getPayload({ config })
try {
  await seedInstalacje(payload)
} finally {
  await payload.destroy()
}
