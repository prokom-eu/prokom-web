import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-postgres'

/**
 * Katalog v2: `Products.legacyId` (one seed id) → `legacyIds` (hasMany text: the seed id first,
 * then the ids of the source sheet). The value moves to the texts tables, so a database seeded
 * before v2 is still matched by `pnpm seed:biznes`. `down` moves the first id back.
 */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
  INSERT INTO "products_texts" ("order", "parent_id", "path", "text")
    SELECT 1, "id", 'legacyIds', "legacy_id" FROM "products" WHERE "legacy_id" IS NOT NULL;
  INSERT INTO "_products_v_texts" ("order", "parent_id", "path", "text")
    SELECT 1, "id", 'version.legacyIds', "version_legacy_id" FROM "_products_v"
    WHERE "version_legacy_id" IS NOT NULL;
  DROP INDEX "products_legacy_id_idx";
  DROP INDEX "_products_v_version_version_legacy_id_idx";
  ALTER TABLE "products" DROP COLUMN "legacy_id";
  ALTER TABLE "_products_v" DROP COLUMN "version_legacy_id";`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
  ALTER TABLE "products" ADD COLUMN "legacy_id" varchar;
  ALTER TABLE "_products_v" ADD COLUMN "version_legacy_id" varchar;
  CREATE INDEX "products_legacy_id_idx" ON "products" USING btree ("legacy_id");
  CREATE INDEX "_products_v_version_version_legacy_id_idx" ON "_products_v" USING btree ("version_legacy_id");
  UPDATE "products" AS p SET "legacy_id" = t."text" FROM "products_texts" AS t
    WHERE t."parent_id" = p."id" AND t."path" = 'legacyIds' AND t."order" = 1;
  UPDATE "_products_v" AS v SET "version_legacy_id" = t."text" FROM "_products_v_texts" AS t
    WHERE t."parent_id" = v."id" AND t."path" = 'version.legacyIds' AND t."order" = 1;
  DELETE FROM "products_texts" WHERE "path" = 'legacyIds';
  DELETE FROM "_products_v_texts" WHERE "path" = 'version.legacyIds';`)
}
