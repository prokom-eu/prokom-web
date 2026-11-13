import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

/**
 * SEO etap 1 — data only: the footer of Software links the Rabka-Zdrój page from every page (it
 * was reachable from the site map only), at the end of the „Firma” column — as the seed does, for
 * the databases it does not write (staging, production). Only where the town page is active and
 * the link is not there yet; `down` takes out only this link.
 */

const LABEL = 'Strony internetowe Rabka-Zdrój'
const HREF = '/miejscowosci/rabka-zdroj'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    INSERT INTO "site_settings_shared_footer_columns_links" ("_order", "_parent_id", "id", "label", "href")
    SELECT
      COALESCE((SELECT MAX(l."_order") FROM "site_settings_shared_footer_columns_links" l
                 WHERE l."_parent_id" = c."id"), 0) + 1,
      c."id",
      substr(md5(random()::text || c."id"), 1, 24),
      ${LABEL},
      ${HREF}
    FROM "site_settings_shared_footer_columns" c
    JOIN "site_settings" s ON s."id" = c."_parent_id"
    JOIN "tenants" t ON t."id" = s."tenant_id"
    WHERE t."line" = 'software' AND c."heading" = 'Firma'
      AND EXISTS (
        SELECT 1 FROM "cities" ci
         WHERE ci."tenant_id" = t."id" AND ci."slug" = 'rabka-zdroj' AND ci."active" = true
      )
      AND NOT EXISTS (
        SELECT 1 FROM "site_settings_shared_footer_columns_links" l
          JOIN "site_settings_shared_footer_columns" c2 ON c2."id" = l."_parent_id"
         WHERE c2."_parent_id" = s."id" AND l."href" = ${HREF}
      )`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    DELETE FROM "site_settings_shared_footer_columns_links" l
     USING "site_settings_shared_footer_columns" c, "site_settings" s, "tenants" t
     WHERE l."_parent_id" = c."id" AND c."_parent_id" = s."id" AND s."tenant_id" = t."id"
       AND t."line" = 'software' AND l."href" = ${HREF} AND l."label" = ${LABEL}`)
}
