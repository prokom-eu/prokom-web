import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

// SWA4c, decyzja D7 (PRZEKAZANIE-v24 §0.1, Krystian 08.11): Software post categories become
// Poradnik, Strony, Systemy, Automatyzacje, Bezpieczeństwo. Old values are rewritten while the
// column is text — „Nowości” → Poradnik, „Realizacje” → Strony — so the cast to the new enum never
// meets a removed value. Other lines' values stay as they are. `down` maps back by name
// (Strony → Realizacje, the other new ones → Poradnik): the exact old split is not restored.
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "posts" ALTER COLUMN "category" SET DATA TYPE text;
  UPDATE "posts" SET "category" = 'poradnik' WHERE "category" = 'nowosci';
  UPDATE "posts" SET "category" = 'strony' WHERE "category" = 'realizacje';
  DROP TYPE "public"."enum_posts_category";
  CREATE TYPE "public"."enum_posts_category" AS ENUM('ksef', 'kasy', 'terminale', 'dofinansowania', 'programy', 'poradnik', 'strony', 'systemy', 'automatyzacje', 'bezpieczenstwo', 'przepisy', 'monitoring', 'noclegi', 'energia', 'dzwiek-obraz');
  ALTER TABLE "posts" ALTER COLUMN "category" SET DATA TYPE "public"."enum_posts_category" USING "category"::"public"."enum_posts_category";
  ALTER TABLE "_posts_v" ALTER COLUMN "version_category" SET DATA TYPE text;
  UPDATE "_posts_v" SET "version_category" = 'poradnik' WHERE "version_category" = 'nowosci';
  UPDATE "_posts_v" SET "version_category" = 'strony' WHERE "version_category" = 'realizacje';
  DROP TYPE "public"."enum__posts_v_version_category";
  CREATE TYPE "public"."enum__posts_v_version_category" AS ENUM('ksef', 'kasy', 'terminale', 'dofinansowania', 'programy', 'poradnik', 'strony', 'systemy', 'automatyzacje', 'bezpieczenstwo', 'przepisy', 'monitoring', 'noclegi', 'energia', 'dzwiek-obraz');
  ALTER TABLE "_posts_v" ALTER COLUMN "version_category" SET DATA TYPE "public"."enum__posts_v_version_category" USING "version_category"::"public"."enum__posts_v_version_category";`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "posts" ALTER COLUMN "category" SET DATA TYPE text;
  UPDATE "posts" SET "category" = 'realizacje' WHERE "category" = 'strony';
  UPDATE "posts" SET "category" = 'poradnik' WHERE "category" IN ('systemy', 'automatyzacje', 'bezpieczenstwo');
  DROP TYPE "public"."enum_posts_category";
  CREATE TYPE "public"."enum_posts_category" AS ENUM('ksef', 'kasy', 'terminale', 'dofinansowania', 'programy', 'poradnik', 'nowosci', 'realizacje', 'przepisy', 'monitoring', 'noclegi', 'energia', 'dzwiek-obraz');
  ALTER TABLE "posts" ALTER COLUMN "category" SET DATA TYPE "public"."enum_posts_category" USING "category"::"public"."enum_posts_category";
  ALTER TABLE "_posts_v" ALTER COLUMN "version_category" SET DATA TYPE text;
  UPDATE "_posts_v" SET "version_category" = 'realizacje' WHERE "version_category" = 'strony';
  UPDATE "_posts_v" SET "version_category" = 'poradnik' WHERE "version_category" IN ('systemy', 'automatyzacje', 'bezpieczenstwo');
  DROP TYPE "public"."enum__posts_v_version_category";
  CREATE TYPE "public"."enum__posts_v_version_category" AS ENUM('ksef', 'kasy', 'terminale', 'dofinansowania', 'programy', 'poradnik', 'nowosci', 'realizacje', 'przepisy', 'monitoring', 'noclegi', 'energia', 'dzwiek-obraz');
  ALTER TABLE "_posts_v" ALTER COLUMN "version_category" SET DATA TYPE "public"."enum__posts_v_version_category" USING "version_category"::"public"."enum__posts_v_version_category";`)
}
