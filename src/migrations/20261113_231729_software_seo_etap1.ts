import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

/**
 * SEO etap 1 (Software) — data only, for the databases the seed does not write (staging,
 * production); `down` undoes it the same way:
 * - the start page's title and description get „strony internetowe” (the phrase people type) and
 *   the region — only while they still hold the old seed text exactly (an edit in the panel stays);
 * - the footer links the Rabka-Zdrój page from every page (it was reachable from the site map
 *   only), at the end of the „Firma” column — only where the town page is active and the link is
 *   not there yet.
 */

const SOFTWARE_TENANTS = sql`SELECT "id" FROM "tenants" WHERE "line" = 'software'`

const HOME = {
  title: {
    old: 'Strony i systemy dla firm — Rabka-Zdrój | PRO-KOM Software',
    new: 'Strony internetowe i systemy — Rabka, Podhale | PRO-KOM Software',
  },
  description: {
    old: 'Strony internetowe, systemy dla firm i aplikacje z Rabki-Zdroju. Cena „od” i termin od razu, stała wycena, opieka po starcie.',
    new: 'Strony internetowe, sklepy i systemy dla firm z Rabki-Zdroju i Podhala. Cena „od” i termin od razu, stała wycena, opieka po starcie.',
  },
} as const

const FOOTER_LINK = { label: 'Strony internetowe Rabka-Zdrój', href: '/miejscowosci/rabka-zdroj' }

async function swapHome(db: MigrateUpArgs['db'], back: boolean): Promise<void> {
  for (const [field, text] of Object.entries(HOME)) {
    const [from, to] = back ? [text.new, text.old] : [text.old, text.new]
    const column = sql.identifier(`seo_${field}`)
    const versionColumn = sql.identifier(`version_seo_${field}`)
    await db.execute(sql`
      UPDATE "pages" SET ${column} = ${to}
       WHERE ${column} = ${from} AND "slug" = 'home' AND "tenant_id" IN (${SOFTWARE_TENANTS})`)
    await db.execute(sql`
      UPDATE "_pages_v" SET ${versionColumn} = ${to}
       WHERE ${versionColumn} = ${from} AND "latest" = true AND "version_slug" = 'home'
         AND "version_tenant_id" IN (${SOFTWARE_TENANTS})`)
  }
}

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await swapHome(db, false)
  await db.execute(sql`
    INSERT INTO "site_settings_shared_footer_columns_links" ("_order", "_parent_id", "id", "label", "href")
    SELECT
      COALESCE((SELECT MAX(l."_order") FROM "site_settings_shared_footer_columns_links" l
                 WHERE l."_parent_id" = c."id"), 0) + 1,
      c."id",
      substr(md5(random()::text || c."id"), 1, 24),
      ${FOOTER_LINK.label},
      ${FOOTER_LINK.href}
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
         WHERE c2."_parent_id" = s."id" AND l."href" = ${FOOTER_LINK.href}
      )`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    DELETE FROM "site_settings_shared_footer_columns_links" l
     USING "site_settings_shared_footer_columns" c, "site_settings" s, "tenants" t
     WHERE l."_parent_id" = c."id" AND c."_parent_id" = s."id" AND s."tenant_id" = t."id"
       AND t."line" = 'software' AND l."href" = ${FOOTER_LINK.href}
       AND l."label" = ${FOOTER_LINK.label}`)
  await swapHome(db, true)
}
