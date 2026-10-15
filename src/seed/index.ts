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

  const [user] = existing.docs
  if (user?.role === 'admin') {
    payload.logger.info('Seed: local admin already exists, skipped.')
  } else if (user) {
    // Local-only: restore the admin role if the account was demoted by hand.
    await payload.update({
      collection: 'users',
      id: user.id,
      data: { role: 'admin' },
      overrideAccess: true,
    })
    payload.logger.info('Seed: existing local account promoted back to admin.')
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
