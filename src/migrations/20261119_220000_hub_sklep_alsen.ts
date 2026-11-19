import type { MigrateDownArgs, MigrateUpArgs } from '@payloadcms/db-postgres'

import { emailsWithShop, trustWithAlsenFigure } from './data/hub_sklep_alsen'

/**
 * Hub data 19.11.2026 (Krystian) — data only, no schema change: on `/kontakt` the shop address
 * `sklep@pro-kom.eu` („Zamówienia”, shown) instead of the unused `sklep@pro-kom.pl`, and the fact
 * „ALSEN 350+” approved. Through the Local API; `down` keeps the data.
 */
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
    if (!settings) continue
    const extraEmails = emailsWithShop(settings.extraEmails)
    const trust = trustWithAlsenFigure(settings.trust)
    const data = { ...(extraEmails && { extraEmails }), ...(trust && { trust }) }
    if (Object.keys(data).length) {
      await payload.update({ collection: 'hub-settings', id: settings.id, data, ...local })
    }
    payload.logger.info(`Hub 19.11: hub-settings — ${Object.keys(data).join(', ') || 'bez zmian'}`)
  }
}

export async function down(_args: MigrateDownArgs): Promise<void> {
  // Data stays: the panel may have edited it since.
}
