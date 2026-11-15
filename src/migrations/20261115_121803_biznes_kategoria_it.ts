/**
 * Audyt 15.11 (decyzja Krystiana): the Biznes post category „IT w firmie” — the enum gets one
 * value, nothing is removed. Down fails while a post or an old version in `_posts_v` still uses
 * the value: change the category of those posts and delete their old versions first.
 */
import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TYPE "public"."enum_posts_category" ADD VALUE 'it-w-firmie' BEFORE 'poradnik';
  ALTER TYPE "public"."enum__posts_v_version_category" ADD VALUE 'it-w-firmie' BEFORE 'poradnik';`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "posts" ALTER COLUMN "category" SET DATA TYPE text;
  DROP TYPE "public"."enum_posts_category";
  CREATE TYPE "public"."enum_posts_category" AS ENUM('ksef', 'kasy', 'terminale', 'dofinansowania', 'programy', 'poradnik', 'strony', 'systemy', 'automatyzacje', 'bezpieczenstwo', 'przepisy', 'monitoring', 'noclegi', 'energia', 'dzwiek-obraz', 'alarmy', 'sieci', 'smart-home', 'ladowarki', 'anteny');
  ALTER TABLE "posts" ALTER COLUMN "category" SET DATA TYPE "public"."enum_posts_category" USING "category"::"public"."enum_posts_category";
  ALTER TABLE "_posts_v" ALTER COLUMN "version_category" SET DATA TYPE text;
  DROP TYPE "public"."enum__posts_v_version_category";
  CREATE TYPE "public"."enum__posts_v_version_category" AS ENUM('ksef', 'kasy', 'terminale', 'dofinansowania', 'programy', 'poradnik', 'strony', 'systemy', 'automatyzacje', 'bezpieczenstwo', 'przepisy', 'monitoring', 'noclegi', 'energia', 'dzwiek-obraz', 'alarmy', 'sieci', 'smart-home', 'ladowarki', 'anteny');
  ALTER TABLE "_posts_v" ALTER COLUMN "version_category" SET DATA TYPE "public"."enum__posts_v_version_category" USING "version_category"::"public"."enum__posts_v_version_category";`)
}
