import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

/**
 * SWV8 B — data only, no schema change: the title of the Software start page saved in the panel
 * (78 characters, cut in search results) becomes the seed's shorter one (audyt 01.11 P2), in the
 * page and its versions, only where it is still exactly the old one and only for the Software
 * tenants. `down` restores nothing.
 */

const OLD = 'Strony, systemy i aplikacje dla firm — Rabka-Zdrój, Podhale | PRO-KOM Software'
const NEW = 'Strony i systemy dla firm — Rabka-Zdrój | PRO-KOM Software'
const SOFTWARE_TENANTS = sql`SELECT "id" FROM "tenants" WHERE "line" = 'software'`

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(
    sql`UPDATE "pages" SET "seo_title" = ${NEW} WHERE "seo_title" = ${OLD} AND "tenant_id" IN (${SOFTWARE_TENANTS})`,
  )
  await db.execute(
    sql`UPDATE "_pages_v" SET "version_seo_title" = ${NEW} WHERE "version_seo_title" = ${OLD} AND "version_tenant_id" IN (${SOFTWARE_TENANTS})`,
  )
}

export async function down(_args: MigrateDownArgs): Promise<void> {
  // The old title was too long for search results; nothing to restore.
}
