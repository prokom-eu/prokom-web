import type { MigrateDownArgs, MigrateUpArgs } from '@payloadcms/db-postgres'

import { contactWith2211, homeWithBothPhones, instalacjePhone2 } from './data/hub_kontakt'

/**
 * Contact of pro-kom.eu (Krystian 22.11.2026) — data only, for databases the hub seed does not
 * write (production): the second number at Biznes and Instalacje on the home page
 * (`home.contact.bothPhones`; Instalacje's own second number 501 046 249 into its `SiteSettings`),
 * and on `/kontakt` the H1 without „one number” and the hub's e-mail in the hero bar. Through the Local API, only where the old value still stands — panel edits
 * stay. `down` keeps the data (optional fields; the old texts would contradict the two tiles).
 */

export async function up(args: MigrateUpArgs): Promise<void> {
  await hub(args)
  await instalacje(args)
}

async function hub({ payload, req }: MigrateUpArgs): Promise<void> {
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
  const home = homeWithBothPhones(settings?.home)
  if (settings && home) {
    await payload.update({ collection: 'hub-settings', id: settings.id, data: { home }, ...local })
  }
  payload.logger.info(
    `HUB kontakt: dwa numery Biznes i Instalacje — ${home ? 'dodane' : 'bez zmian'}`,
  )

  const {
    docs: [site],
  } = await payload.find({
    collection: 'site-settings',
    where: { tenant: { equals: tenant.id } },
    limit: 1,
    ...local,
  })
  const contact = contactWith2211(site?.shared?.contact)
  if (site?.shared && contact) {
    await payload.update({
      collection: 'site-settings',
      id: site.id,
      data: { shared: { ...site.shared, contact } },
      ...local,
    })
  }
  payload.logger.info(
    `HUB kontakt: /kontakt (H1, e-mail w pasku) — ${contact ? 'zmienione' : 'bez zmian'}`,
  )
}

async function instalacje({ payload, req }: MigrateUpArgs): Promise<void> {
  const local = { req, overrideAccess: true, depth: 0, context: { seed: true } } as const
  const {
    docs: [tenant],
  } = await payload.find({
    collection: 'tenants',
    where: { slug: { equals: 'instalacje' } },
    limit: 1,
    ...local,
  })
  if (!tenant) return
  const {
    docs: [site],
  } = await payload.find({
    collection: 'site-settings',
    where: { tenant: { equals: tenant.id } },
    limit: 1,
    ...local,
  })
  const phone2 = site ? instalacjePhone2(site.phone2) : null
  if (site && phone2) {
    await payload.update({ collection: 'site-settings', id: site.id, data: { phone2 }, ...local })
  }
  payload.logger.info(`HUB kontakt: drugi numer Instalacji — ${phone2 ? 'dodany' : 'bez zmian'}`)
}

export async function down(_args: MigrateDownArgs): Promise<void> {
  // Data stays: see above.
}
