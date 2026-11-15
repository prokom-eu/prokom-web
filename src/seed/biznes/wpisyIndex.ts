/**
 * `pnpm seed:biznes-wpisy` — only the Biznes guide posts (audyt 15.11 P1-3): a missing post is
 * created and published, an existing one is never touched. On production through
 * `scripts/prod-line-content.sh biznes-wpisy` (ADR-027 „Rozstrzygnięcia 15.11”); locally
 * `pnpm seed:biznes` runs the same step. Needs the tenant `biznes` and an up-to-date schema.
 */
import { getPayload } from 'payload'

import config from '../../payload.config'
import { assertSeedAllowed } from '../config'
import { seedBiznesGuidePosts } from './guidePosts'

assertSeedAllowed(process.env.NODE_ENV)

const payload = await getPayload({ config })
try {
  const {
    docs: [tenant],
  } = await payload.find({
    collection: 'tenants',
    where: { slug: { equals: 'biznes' } },
    limit: 1,
    depth: 0,
    overrideAccess: true,
  })
  if (!tenant) throw new Error('Seed (Biznes wpisy): no tenant "biznes".')
  let created = 0
  await seedBiznesGuidePosts(payload, tenant.id, (name, changed) => {
    if (!changed) return
    created++
    payload.logger.info(`Seed (Biznes wpisy): created ${name}`)
  })
  payload.logger.info(`Seed (Biznes wpisy): ${created} created, the rest already there.`)
} finally {
  await payload.destroy()
}
