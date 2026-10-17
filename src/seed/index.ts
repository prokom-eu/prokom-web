/**
 * Local seed: `pnpm seed` (runs through `payload run`). Idempotent — safe to run repeatedly.
 * Requires an up-to-date schema: run `pnpm payload migrate` first.
 */
import { getPayload } from 'payload'

import config from '../payload.config'
import { assertSeedAllowed, parseSeedEnv } from './config'
import { sampleImage } from './media'
import {
  SAMPLE_COMPANY,
  SAMPLE_PARTNER_NAME,
  sampleImageAlt,
  missingSampleBlocks,
  samplePages,
  sampleSiteSettings,
} from './sample'
import { SEED_TENANTS, seedNotificationEmail } from './tenants'

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
    const notificationEmail = seedNotificationEmail(tenant.slug)
    if (tenantDoc && !tenantDoc.notificationEmail) {
      // Tenants seeded before S8 get the inquiry inbox; one set in the panel is kept.
      tenantDoc = await payload.update({
        collection: 'tenants',
        id: tenantDoc.id,
        data: { notificationEmail },
        overrideAccess: true,
      })
      payload.logger.info(`Seed: tenant "${tenant.slug}" got a notification e-mail.`)
    } else if (tenantDoc) {
      payload.logger.info(`Seed: tenant "${tenant.slug}" already exists, skipped.`)
    } else {
      tenantDoc = await payload.create({
        collection: 'tenants',
        data: {
          ...tenant,
          notificationEmail,
          active: true,
          domains: [{ host: localHost, environment: 'local' }],
        },
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

    const alt = sampleImageAlt(tenant)
    const existingImage = await payload.find({
      collection: 'media',
      where: { and: [{ tenant: { equals: tenantDoc.id } }, { alt: { equals: alt } }] },
      limit: 1,
      depth: 0,
      overrideAccess: true,
    })
    let [imageDoc] = existingImage.docs
    if (imageDoc) {
      payload.logger.info(`Seed: sample image of "${tenant.slug}" already exists, skipped.`)
    } else {
      const data = await sampleImage(1600, 900)
      imageDoc = await payload.create({
        collection: 'media',
        data: { alt, source: 'Wygenerowany przez seed', tenant: tenantDoc.id },
        file: {
          data,
          mimetype: 'image/png',
          name: `przyklad-${tenant.slug}.png`,
          size: data.length,
        },
        overrideAccess: true,
      })
      payload.logger.info(`Seed: sample image of "${tenant.slug}" created.`)
    }

    for (const page of samplePages(tenant, imageDoc.id)) {
      const {
        docs: [existingPage],
      } = await payload.find({
        collection: 'pages',
        where: { and: [{ tenant: { equals: tenantDoc.id } }, { slug: { equals: page.slug } }] },
        limit: 1,
        depth: 0,
        overrideAccess: true,
      })
      if (existingPage) {
        const missing = missingSampleBlocks(existingPage.layout, page.layout ?? [])
        if (missing.length === 0) {
          payload.logger.info(`Seed: page "${tenant.slug}/${page.slug}" already exists, skipped.`)
          continue
        }
        await payload.update({
          collection: 'pages',
          id: existingPage.id,
          data: { layout: [...(existingPage.layout ?? []), ...missing], _status: 'published' },
          overrideAccess: true,
        })
        payload.logger.info(`Seed: page "${tenant.slug}/${page.slug}" got new sample blocks.`)
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

  const { totalDocs: partnerCount } = await payload.count({
    collection: 'partners',
    where: { name: { equals: SAMPLE_PARTNER_NAME } },
    overrideAccess: true,
  })
  if (partnerCount > 0) {
    payload.logger.info('Seed: sample partner already exists, skipped.')
  } else {
    const { docs: tenants } = await payload.find({
      collection: 'tenants',
      where: { slug: { in: SEED_TENANTS.map((tenant) => tenant.slug) } },
      depth: 0,
      overrideAccess: true,
    })
    const data = await sampleImage(400, 160)
    await payload.create({
      collection: 'partners',
      data: {
        name: SAMPLE_PARTNER_NAME,
        partnerStatus: 'none',
        tenants: tenants.map((tenant) => tenant.id),
      },
      file: { data, mimetype: 'image/png', name: 'partner-przyklad.png', size: data.length },
      overrideAccess: true,
    })
    payload.logger.info('Seed: sample partner created.')
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
