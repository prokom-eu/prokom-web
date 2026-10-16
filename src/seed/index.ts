/**
 * Local seed: `pnpm seed` (runs through `payload run`). Idempotent — safe to run repeatedly.
 * Requires an up-to-date schema: run `pnpm payload migrate` first.
 */
import { getPayload } from 'payload'

import config from '../payload.config'
import { assertSeedAllowed, parseSeedEnv } from './config'
import { SAMPLE_COMPANY, samplePages, sampleSiteSettings } from './sample'
import { SEED_TENANTS } from './tenants'

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

  for (const [index, { localHost, ...tenant }] of SEED_TENANTS.entries()) {
    const existingTenant = await payload.find({
      collection: 'tenants',
      where: { slug: { equals: tenant.slug } },
      limit: 1,
      depth: 0,
      overrideAccess: true,
    })
    let [tenantDoc] = existingTenant.docs
    if (tenantDoc) {
      payload.logger.info(`Seed: tenant "${tenant.slug}" already exists, skipped.`)
    } else {
      tenantDoc = await payload.create({
        collection: 'tenants',
        data: { ...tenant, active: true, domains: [{ host: localHost, environment: 'local' }] },
        overrideAccess: true,
      })
      payload.logger.info(`Seed: tenant "${tenant.slug}" created.`)
    }

    const { totalDocs: settingsCount } = await payload.count({
      collection: 'site-settings',
      where: { tenant: { equals: tenantDoc.id } },
      overrideAccess: true,
    })
    if (settingsCount > 0) {
      payload.logger.info(`Seed: settings of "${tenant.slug}" already exist, skipped.`)
    } else {
      await payload.create({
        collection: 'site-settings',
        data: { ...sampleSiteSettings(tenant, index), tenant: tenantDoc.id },
        overrideAccess: true,
      })
      payload.logger.info(`Seed: sample settings of "${tenant.slug}" created.`)
    }

    for (const page of samplePages(tenant)) {
      const { totalDocs: pageCount } = await payload.count({
        collection: 'pages',
        where: { and: [{ tenant: { equals: tenantDoc.id } }, { slug: { equals: page.slug } }] },
        overrideAccess: true,
      })
      if (pageCount > 0) {
        payload.logger.info(`Seed: page "${tenant.slug}/${page.slug}" already exists, skipped.`)
        continue
      }
      await payload.create({
        collection: 'pages',
        data: { ...page, tenant: tenantDoc.id, _status: 'published' },
        overrideAccess: true,
      })
      payload.logger.info(`Seed: sample page "${tenant.slug}/${page.slug}" published.`)
    }
  }

  // The global always exists; it counts as unset until it has a company name.
  const company = await payload.findGlobal({ slug: 'company-data', overrideAccess: true })
  if (company.name) {
    payload.logger.info('Seed: company data already set, skipped.')
  } else {
    await payload.updateGlobal({
      slug: 'company-data',
      data: SAMPLE_COMPANY,
      overrideAccess: true,
    })
    payload.logger.info('Seed: sample company data set.')
  }
} finally {
  await payload.destroy()
}
