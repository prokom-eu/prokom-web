import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

import { WIZARD_V3_FROZEN } from './data/software_wizard_v3'

/**
 * SWA3 — wizard v3 (decision Krystian 08.11 — removes data): `software_settings.wizard` of every
 * Software tenant that is not v3 yet (no `types`) becomes the frozen v3 value. The v22 rules go
 * (needs, results, recommend/honest, add-ons, scopes, terms); `priceDisplay` stays, because the
 * cards, the price list and the offer window read it. The table does not change (jsonb).
 * `down` does nothing: the v22 rules are not restored (a rollback of the data = the database
 * backup taken before the deploy, `docs/runbook.md`).
 */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  const value = JSON.stringify(WIZARD_V3_FROZEN)
  await db.execute(sql`
    UPDATE "software_settings"
    SET "wizard" = ${value}::jsonb || CASE
      WHEN jsonb_typeof("wizard"->'priceDisplay') = 'object'
        THEN jsonb_build_object('priceDisplay', "wizard"->'priceDisplay')
      ELSE '{}'::jsonb
    END
    WHERE "tenant_id" IN (SELECT "id" FROM "tenants" WHERE "line" = 'software')
      AND ("wizard" IS NULL OR jsonb_typeof("wizard") <> 'object' OR NOT ("wizard" ? 'types'))`)
}

export async function down(_args: MigrateDownArgs): Promise<void> {
  // The v22 rules are not restored — see above.
}
