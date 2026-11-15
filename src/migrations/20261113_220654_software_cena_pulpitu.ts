import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

/**
 * Price of the company dashboard (decision Krystian 13.11.2026, SWA14 §4.5): `pulpit-firmy` from
 * 1 999 zł netto. Data only, for the databases the seed does not write (staging, production) —
 * the SWA14 migration left the price empty. Only while it is still empty: a price typed in the
 * panel stays. `down` empties it again only while it is this price.
 */

const SLUG = 'pulpit-firmy'
const PRICE = 1999
const SOFTWARE_TENANTS = sql`SELECT "id" FROM "tenants" WHERE "line" = 'software'`

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    UPDATE "solutions" SET "price_from" = ${PRICE}, "updated_at" = now()
     WHERE "slug" = ${SLUG} AND "price_from" IS NULL AND "tenant_id" IN (${SOFTWARE_TENANTS})`)
  await db.execute(sql`
    UPDATE "_solutions_v" v SET "version_price_from" = ${PRICE}, "updated_at" = now()
      FROM "solutions" s
     WHERE v."parent_id" = s."id" AND v."latest" = true AND s."slug" = ${SLUG}
       AND v."version_price_from" IS NULL AND s."tenant_id" IN (${SOFTWARE_TENANTS})`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    UPDATE "_solutions_v" v SET "version_price_from" = NULL, "updated_at" = now()
      FROM "solutions" s
     WHERE v."parent_id" = s."id" AND v."latest" = true AND s."slug" = ${SLUG}
       AND v."version_price_from" = ${PRICE} AND s."tenant_id" IN (${SOFTWARE_TENANTS})`)
  await db.execute(sql`
    UPDATE "solutions" SET "price_from" = NULL, "updated_at" = now()
     WHERE "slug" = ${SLUG} AND "price_from" = ${PRICE} AND "tenant_id" IN (${SOFTWARE_TENANTS})`)
}
