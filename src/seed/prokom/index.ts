/**
 * `pnpm seed:prokom` — only the pro-kom.eu hub content (`pnpm seed` runs it too). Needs the tenant
 * `prokom` (locally from `pnpm seed`) and an up-to-date schema (`pnpm payload migrate`). Production:
 * only through `scripts/prod-line-content.sh prokom`, before the hub has its production domain.
 */
import { getPayload } from 'payload'

import config from '../../payload.config'
import { assertSeedAllowed } from '../config'
import { seedProkom } from './run'

assertSeedAllowed(process.env.NODE_ENV)

const payload = await getPayload({ config })
try {
  await seedProkom(payload)
} finally {
  await payload.destroy()
}
