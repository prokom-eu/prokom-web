import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

/**
 * SEO etap 1 — data only: the start page of Software gets „strony internetowe” (the phrase people
 * type) and the region in its title and description, for the databases the seed does not write
 * (staging, production). Only while the page still holds the old seed text exactly: a title or
 * description written in the panel stays. `down` swaps them back the same way.
 */

const SOFTWARE_TENANTS = sql`SELECT "id" FROM "tenants" WHERE "line" = 'software'`

const TEXTS = {
  title: {
    old: 'Strony i systemy dla firm — Rabka-Zdrój | PRO-KOM Software',
    new: 'Strony internetowe i systemy — Rabka, Podhale | PRO-KOM Software',
  },
  description: {
    old: 'Strony internetowe, systemy dla firm i aplikacje z Rabki-Zdroju. Cena „od” i termin od razu, stała wycena, opieka po starcie.',
    new: 'Strony internetowe, sklepy i systemy dla firm z Rabki-Zdroju i Podhala. Cena „od” i termin od razu, stała wycena, opieka po starcie.',
  },
} as const

async function swap(db: MigrateUpArgs['db'], back: boolean): Promise<void> {
  for (const [field, text] of Object.entries(TEXTS)) {
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
  await swap(db, false)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await swap(db, true)
}
