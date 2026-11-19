import type { MigrateDownArgs, MigrateUpArgs } from '@payloadcms/db-postgres'

import { homeWithNetwork, railWithAlsen } from './data/hub_alsen_sekcja'

/**
 * ALSEN premium section of the hub's home (Krystian 19.11.2026) — data only, for databases the
 * hub seed does not write (production): `home.network` and „ALSEN” in the rail before
 * „Współpraca”. Through the Local API, only ADDING what is missing — panel edits stay.
 * `down` keeps the data (the field is optional, the page renders without it).
 */

export async function up({ payload, req }: MigrateUpArgs): Promise<void> {
  // `seed`: no revalidation outside a Next.js request.
  const local = { req, overrideAccess: true, depth: 0, context: { seed: true } } as const
  const {
    docs: [tenant],
  } = await payload.find({
    collection: 'tenants',
    where: { slug: { equals: 'prokom' } },
    limit: 1,
    ...local,
  })
  if (!tenant) return

  const {
    docs: [settings],
  } = await payload.find({
    collection: 'hub-settings',
    where: { tenant: { equals: tenant.id } },
    limit: 1,
    ...local,
  })
  const home = homeWithNetwork(settings?.home)
  if (settings && home) {
    await payload.update({ collection: 'hub-settings', id: settings.id, data: { home }, ...local })
  }
  payload.logger.info(`HUB ALSEN: sekcja na głównej — ${home ? 'dodana' : 'bez zmian'}`)

  const {
    docs: [site],
  } = await payload.find({
    collection: 'site-settings',
    where: { tenant: { equals: tenant.id } },
    limit: 1,
    ...local,
  })
  const sections = railWithAlsen(site?.shared?.rail?.sections)
  if (site?.shared?.rail && sections) {
    await payload.update({
      collection: 'site-settings',
      id: site.id,
      data: { shared: { ...site.shared, rail: { ...site.shared.rail, sections } } },
      ...local,
    })
    payload.logger.info('HUB ALSEN: szyna — dodane „ALSEN”')
  }
}

export async function down(_args: MigrateDownArgs): Promise<void> {
  // Data stays: the field is optional and the panel may have edited it.
}
