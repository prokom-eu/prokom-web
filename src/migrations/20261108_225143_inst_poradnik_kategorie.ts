import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TYPE "public"."enum_posts_category" ADD VALUE 'alarmy';
  ALTER TYPE "public"."enum_posts_category" ADD VALUE 'sieci';
  ALTER TYPE "public"."enum_posts_category" ADD VALUE 'smart-home';
  ALTER TYPE "public"."enum_posts_category" ADD VALUE 'ladowarki';
  ALTER TYPE "public"."enum_posts_category" ADD VALUE 'anteny';
  ALTER TYPE "public"."enum__posts_v_version_category" ADD VALUE 'alarmy';
  ALTER TYPE "public"."enum__posts_v_version_category" ADD VALUE 'sieci';
  ALTER TYPE "public"."enum__posts_v_version_category" ADD VALUE 'smart-home';
  ALTER TYPE "public"."enum__posts_v_version_category" ADD VALUE 'ladowarki';
  ALTER TYPE "public"."enum__posts_v_version_category" ADD VALUE 'anteny';`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "posts" ALTER COLUMN "category" SET DATA TYPE text;
  DROP TYPE "public"."enum_posts_category";
  CREATE TYPE "public"."enum_posts_category" AS ENUM('ksef', 'kasy', 'terminale', 'dofinansowania', 'programy', 'poradnik', 'strony', 'systemy', 'automatyzacje', 'bezpieczenstwo', 'przepisy', 'monitoring', 'noclegi', 'energia', 'dzwiek-obraz');
  ALTER TABLE "posts" ALTER COLUMN "category" SET DATA TYPE "public"."enum_posts_category" USING "category"::"public"."enum_posts_category";
  ALTER TABLE "_posts_v" ALTER COLUMN "version_category" SET DATA TYPE text;
  DROP TYPE "public"."enum__posts_v_version_category";
  CREATE TYPE "public"."enum__posts_v_version_category" AS ENUM('ksef', 'kasy', 'terminale', 'dofinansowania', 'programy', 'poradnik', 'strony', 'systemy', 'automatyzacje', 'bezpieczenstwo', 'przepisy', 'monitoring', 'noclegi', 'energia', 'dzwiek-obraz');
  ALTER TABLE "_posts_v" ALTER COLUMN "version_category" SET DATA TYPE "public"."enum__posts_v_version_category" USING "version_category"::"public"."enum__posts_v_version_category";`)
}
