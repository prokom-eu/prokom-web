import type { MigrateDownArgs, MigrateUpArgs } from '@payloadcms/db-postgres'

import { extraEmailsWith1911, instRailWith1911, trustWith1911 } from './data/hub_r1_poprawki'

/**
 * HUB-R1 follow-up (Krystian 19.11.2026) — data only, for databases the seeds do not write
 * (production): the ALSEN facts „350+” and „Rabka” approved, „Zamówienia” = `sklep@pro-kom.eu`
 * (shown) instead of the dead `sklep@pro-kom.pl`, and „Sprzęt” in the Instalacje home rail.
 * Through the Local API, changing only what still differs — a second run changes nothing.
 * `down` keeps the data (the texts are valid either way).
 */

export async function up({ payload, req }: MigrateUpArgs): Promise<void> {
  // `seed`: no revalidation outside a Next.js request.
  const local = { req, overrideAccess: true, depth: 0, context: { seed: true } } as const
  const tenantId = async (slug: string) => {
    const { docs } = await payload.find({
      collection: 'tenants',
      where: { slug: { equals: slug } },
      limit: 1,
      ...local,
    })
    return docs[0]?.id
  }

  const prokom = await tenantId('prokom')
  if (prokom !== undefined) {
    const {
      docs: [settings],
    } = await payload.find({
      collection: 'hub-settings',
      where: { tenant: { equals: prokom } },
      limit: 1,
      ...local,
    })
    if (settings) {
      const trust = trustWith1911(settings.trust)
      const extraEmails = extraEmailsWith1911(settings.extraEmails)
      const data = { ...(trust && { trust }), ...(extraEmails && { extraEmails }) }
      if (Object.keys(data).length) {
        await payload.update({ collection: 'hub-settings', id: settings.id, data, ...local })
      }
      payload.logger.info(
        `HUB-R1 poprawki: hub-settings — ${Object.keys(data).join(', ') || 'bez zmian'}`,
      )
    }
  }

  const instalacje = await tenantId('instalacje')
  if (instalacje !== undefined) {
    const {
      docs: [site],
    } = await payload.find({
      collection: 'site-settings',
      where: { tenant: { equals: instalacje } },
      limit: 1,
      ...local,
    })
    const sections = instRailWith1911(site?.shared?.rail?.sections)
    if (site?.shared?.rail && sections) {
      await payload.update({
        collection: 'site-settings',
        id: site.id,
        data: { shared: { ...site.shared, rail: { ...site.shared.rail, sections } } },
        ...local,
      })
      payload.logger.info('HUB-R1 poprawki: szyna Instalacji — dodany „Sprzęt”')
    }
  }
}

export async function down(_args: MigrateDownArgs): Promise<void> {
  // Data stays: the texts are valid without this migration and the panel may have edited them.
}
