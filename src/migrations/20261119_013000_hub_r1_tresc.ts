import type { MigrateDownArgs, MigrateUpArgs } from '@payloadcms/db-postgres'

import {
  brandsWith1811,
  EXTRA_EMAILS_1811,
  homeWith1811,
  railWith1811,
  trustWith1811,
} from './data/hub_r1_tresc'

/**
 * Runda 1811 (HUB-R1) — data only, for databases the hub seed does not write (production runs
 * since 16.11): the ALSEN network and the facts it needs, the procurement section and its rail
 * entry, the old e-mails (switched off but `biuro@`), and the ALSEN 301 to `/o-firmie#alsen`.
 * Through the Local API, only ADDING what is missing — texts, facts, rail and redirects edited in
 * the panel stay. Databases with the seed already applied (local, staging after its content
 * import) change nothing. `down` keeps the data (the schema migrations before carry the fields).
 */

const ALSEN_FROM = ['/produkt/partnerstwo/alsen', '/index.php/produkt/partnerstwo/alsen']

export async function up({ payload, req }: MigrateUpArgs): Promise<void> {
  // `seed`: no revalidation outside a Next.js request.
  const local = { req, overrideAccess: true, depth: 0, context: { seed: true } } as const
  const { docs: tenants } = await payload.find({
    collection: 'tenants',
    where: { slug: { equals: 'prokom' } },
    limit: 1,
    ...local,
  })
  for (const tenant of tenants) {
    const {
      docs: [settings],
    } = await payload.find({
      collection: 'hub-settings',
      where: { tenant: { equals: tenant.id } },
      limit: 1,
      ...local,
    })
    if (settings) {
      const brands = brandsWith1811(settings.brands)
      const home = homeWith1811(settings.home)
      const trust = trustWith1811(settings.trust)
      const extraEmails = settings.extraEmails?.length ? null : EXTRA_EMAILS_1811
      const data = {
        ...(brands && { brands }),
        ...(home && { home }),
        ...(trust && { trust }),
        ...(extraEmails && { extraEmails }),
      }
      if (Object.keys(data).length) {
        await payload.update({ collection: 'hub-settings', id: settings.id, data, ...local })
      }
      payload.logger.info(`HUB-R1: hub-settings — ${Object.keys(data).join(', ') || 'bez zmian'}`)
    }

    const {
      docs: [site],
    } = await payload.find({
      collection: 'site-settings',
      where: { tenant: { equals: tenant.id } },
      limit: 1,
      ...local,
    })
    const sections = railWith1811(site?.shared?.rail?.sections)
    if (site?.shared?.rail && sections) {
      await payload.update({
        collection: 'site-settings',
        id: site.id,
        data: { shared: { ...site.shared, rail: { ...site.shared.rail, sections } } },
        ...local,
      })
      payload.logger.info('HUB-R1: szyna — dodane „Zamówienia”')
    }

    const { docs: redirects } = await payload.find({
      collection: 'redirects',
      where: {
        and: [
          { tenant: { equals: tenant.id } },
          { from: { in: ALSEN_FROM } },
          { to: { equals: '/o-firmie' } },
        ],
      },
      limit: 10,
      ...local,
    })
    for (const redirect of redirects) {
      await payload.update({
        collection: 'redirects',
        id: redirect.id,
        data: { to: '/o-firmie#alsen' },
        ...local,
      })
    }
    payload.logger.info(`HUB-R1: przekierowania ALSEN — ${redirects.length}`)
  }
}

export async function down(_args: MigrateDownArgs): Promise<void> {
  // Data stays: the texts are valid without this migration and the panel may have edited them.
}
