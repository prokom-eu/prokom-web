/**
 * Local seed: `pnpm seed` (runs through `payload run`). Idempotent — safe to run repeatedly.
 * Requires an up-to-date schema: run `pnpm payload migrate` first.
 */
import { getPayload } from 'payload'

import config from '../payload.config'
import { assertSeedAllowed, parseSeedEnv } from './config'

assertSeedAllowed(process.env.NODE_ENV)
const { adminEmail, adminPassword } = parseSeedEnv(process.env)

const payload = await getPayload({ config })

try {
  const existing = await payload.find({
    collection: 'users',
    where: { email: { equals: adminEmail } },
    limit: 1,
    overrideAccess: true,
  })

  if (existing.totalDocs > 0) {
    payload.logger.info('Seed: local admin already exists, skipped.')
  } else {
    await payload.create({
      collection: 'users',
      data: { email: adminEmail, password: adminPassword, role: 'admin' },
      overrideAccess: true,
    })
    payload.logger.info('Seed: local admin created.')
  }
} finally {
  await payload.destroy()
}
