import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_industries_software_problems_icon" AS ENUM('shield', 'cal', 'users', 'store', 'bolt', 'doc', 'life', 'arrow', 'check', 'phone', 'mail', 'pin', 'clock', 'monitor', 'remote', 'bell', 'wallet', 'chat', 'wrench', 'rocket', 'map', 'star', 'q', 'flash', 'grad', 'server', 'compass', 'panel', 'site', 'grid', 'plug', 'ticket', 'lifebuoy', 'chart', 'sign', 'cash', 'search', 'x', 'bed', 'food', 'refresh', 'globe', 'box', 'car', 'home', 'mountain', 'heart', 'bag', 'card', 'target', 'key', 'mega', 'mount', 'brief');
  CREATE TYPE "public"."enum_industries_software_module_map_icon" AS ENUM('shield', 'cal', 'users', 'store', 'bolt', 'doc', 'life', 'arrow', 'check', 'phone', 'mail', 'pin', 'clock', 'monitor', 'remote', 'bell', 'wallet', 'chat', 'wrench', 'rocket', 'map', 'star', 'q', 'flash', 'grad', 'server', 'compass', 'panel', 'site', 'grid', 'plug', 'ticket', 'lifebuoy', 'chart', 'sign', 'cash', 'search', 'x', 'bed', 'food', 'refresh', 'globe', 'box', 'car', 'home', 'mountain', 'heart', 'bag', 'card', 'target', 'key', 'mega', 'mount', 'brief');
  CREATE TYPE "public"."enum_industries_line" AS ENUM('prokom', 'biznes', 'instalacje', 'software');
  CREATE TYPE "public"."enum_industries_software_group" AS ENUM('budowlanka-i-ekipy', 'noclegi', 'turystyka-i-wydarzenia', 'gastronomia', 'zdrowie-i-uroda', 'uslugi-i-transport', 'handel-i-producenci', 'edukacja-i-organizacje');
  CREATE TYPE "public"."enum_industries_software_wizard_firm" AS ENUM('nocleg', 'gastro', 'bud', 'turyst', 'uroda', 'moto', 'handel', 'biuro', 'prod', 'inna');
  CREATE TYPE "public"."enum_posts_line" AS ENUM('prokom', 'biznes', 'instalacje', 'software');
  CREATE TYPE "public"."enum__posts_v_version_line" AS ENUM('prokom', 'biznes', 'instalacje', 'software');
  ALTER TYPE "public"."enum_posts_category" ADD VALUE 'poradnik';
  ALTER TYPE "public"."enum_posts_category" ADD VALUE 'nowosci';
  ALTER TYPE "public"."enum_posts_category" ADD VALUE 'realizacje';
  ALTER TYPE "public"."enum__posts_v_version_category" ADD VALUE 'poradnik';
  ALTER TYPE "public"."enum__posts_v_version_category" ADD VALUE 'nowosci';
  ALTER TYPE "public"."enum__posts_v_version_category" ADD VALUE 'realizacje';
  CREATE TABLE "industries_software_problems" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"question" varchar,
  	"note" varchar,
  	"icon" "enum_industries_software_problems_icon",
  	"title" varchar,
  	"text" varchar,
  	"solution_id" integer,
  	"cta_label" varchar,
  	"cta_href" varchar
  );
  
  CREATE TABLE "industries_software_module_map" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"icon" "enum_industries_software_module_map_icon",
  	"x" numeric,
  	"y" numeric,
  	"delay" numeric
  );
  
  CREATE TABLE "industries_software_offline" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"text" varchar
  );
  
  ALTER TABLE "industries" ADD COLUMN "line" "enum_industries_line";
  ALTER TABLE "industries" ADD COLUMN "software_group" "enum_industries_software_group";
  ALTER TABLE "industries" ADD COLUMN "software_wizard_firm" "enum_industries_software_wizard_firm";
  ALTER TABLE "industries" ADD COLUMN "software_wizard_title" varchar;
  ALTER TABLE "industries_rels" ADD COLUMN "solutions_id" integer;
  ALTER TABLE "posts" ADD COLUMN "line" "enum_posts_line";
  ALTER TABLE "posts_rels" ADD COLUMN "solutions_id" integer;
  ALTER TABLE "_posts_v" ADD COLUMN "version_line" "enum__posts_v_version_line";
  ALTER TABLE "_posts_v_rels" ADD COLUMN "solutions_id" integer;
  ALTER TABLE "industries_software_problems" ADD CONSTRAINT "industries_software_problems_solution_id_solutions_id_fk" FOREIGN KEY ("solution_id") REFERENCES "public"."solutions"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "industries_software_problems" ADD CONSTRAINT "industries_software_problems_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."industries"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "industries_software_module_map" ADD CONSTRAINT "industries_software_module_map_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."industries"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "industries_software_offline" ADD CONSTRAINT "industries_software_offline_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."industries"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "industries_software_problems_order_idx" ON "industries_software_problems" USING btree ("_order");
  CREATE INDEX "industries_software_problems_parent_id_idx" ON "industries_software_problems" USING btree ("_parent_id");
  CREATE INDEX "industries_software_problems_solution_idx" ON "industries_software_problems" USING btree ("solution_id");
  CREATE INDEX "industries_software_module_map_order_idx" ON "industries_software_module_map" USING btree ("_order");
  CREATE INDEX "industries_software_module_map_parent_id_idx" ON "industries_software_module_map" USING btree ("_parent_id");
  CREATE INDEX "industries_software_offline_order_idx" ON "industries_software_offline" USING btree ("_order");
  CREATE INDEX "industries_software_offline_parent_id_idx" ON "industries_software_offline" USING btree ("_parent_id");
  ALTER TABLE "industries_rels" ADD CONSTRAINT "industries_rels_solutions_fk" FOREIGN KEY ("solutions_id") REFERENCES "public"."solutions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "posts_rels" ADD CONSTRAINT "posts_rels_solutions_fk" FOREIGN KEY ("solutions_id") REFERENCES "public"."solutions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_posts_v_rels" ADD CONSTRAINT "_posts_v_rels_solutions_fk" FOREIGN KEY ("solutions_id") REFERENCES "public"."solutions"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "industries_rels_solutions_id_idx" ON "industries_rels" USING btree ("solutions_id");
  CREATE INDEX "posts_rels_solutions_id_idx" ON "posts_rels" USING btree ("solutions_id");
  CREATE INDEX "_posts_v_rels_solutions_id_idx" ON "_posts_v_rels" USING btree ("solutions_id");`)

  // The panel shows the fields of a line from this copy (`copyTenantLine`): existing industries
  // and posts get it now, not only on their next save.
  await db.execute(sql`
  UPDATE "industries" SET "line" = t."line"::text::"enum_industries_line"
    FROM "tenants" t WHERE "industries"."tenant_id" = t."id";
  UPDATE "posts" SET "line" = t."line"::text::"enum_posts_line"
    FROM "tenants" t WHERE "posts"."tenant_id" = t."id";
  UPDATE "_posts_v" SET "version_line" = t."line"::text::"enum__posts_v_version_line"
    FROM "tenants" t WHERE "_posts_v"."version_tenant_id" = t."id";`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  // The old category enum has no Software values: posts in them cannot stay (local databases
  // only — the production database never goes down past a release).
  await db.execute(sql`
  DELETE FROM "_posts_v" WHERE "version_category"::text IN ('poradnik', 'nowosci', 'realizacje');
  DELETE FROM "posts" WHERE "category"::text IN ('poradnik', 'nowosci', 'realizacje');
    DELETE FROM "industries_rels" WHERE "solutions_id" IS NOT NULL;
    DELETE FROM "posts_rels" WHERE "solutions_id" IS NOT NULL;
    DELETE FROM "_posts_v_rels" WHERE "solutions_id" IS NOT NULL;
    DELETE FROM "industries_texts" WHERE "path" LIKE 'software.%';`)
  await db.execute(sql`
   ALTER TABLE "industries_software_problems" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "industries_software_module_map" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "industries_software_offline" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "industries_software_problems" CASCADE;
  DROP TABLE "industries_software_module_map" CASCADE;
  DROP TABLE "industries_software_offline" CASCADE;
  ALTER TABLE "industries_rels" DROP CONSTRAINT "industries_rels_solutions_fk";
  
  ALTER TABLE "posts_rels" DROP CONSTRAINT "posts_rels_solutions_fk";
  
  ALTER TABLE "_posts_v_rels" DROP CONSTRAINT "_posts_v_rels_solutions_fk";
  
  ALTER TABLE "posts" ALTER COLUMN "category" SET DATA TYPE text;
  DROP TYPE "public"."enum_posts_category";
  CREATE TYPE "public"."enum_posts_category" AS ENUM('ksef', 'kasy', 'terminale', 'dofinansowania', 'programy');
  ALTER TABLE "posts" ALTER COLUMN "category" SET DATA TYPE "public"."enum_posts_category" USING "category"::"public"."enum_posts_category";
  ALTER TABLE "_posts_v" ALTER COLUMN "version_category" SET DATA TYPE text;
  DROP TYPE "public"."enum__posts_v_version_category";
  CREATE TYPE "public"."enum__posts_v_version_category" AS ENUM('ksef', 'kasy', 'terminale', 'dofinansowania', 'programy');
  ALTER TABLE "_posts_v" ALTER COLUMN "version_category" SET DATA TYPE "public"."enum__posts_v_version_category" USING "version_category"::"public"."enum__posts_v_version_category";
  DROP INDEX "industries_rels_solutions_id_idx";
  DROP INDEX "posts_rels_solutions_id_idx";
  DROP INDEX "_posts_v_rels_solutions_id_idx";
  ALTER TABLE "industries" DROP COLUMN "line";
  ALTER TABLE "industries" DROP COLUMN "software_group";
  ALTER TABLE "industries" DROP COLUMN "software_wizard_firm";
  ALTER TABLE "industries" DROP COLUMN "software_wizard_title";
  ALTER TABLE "industries_rels" DROP COLUMN "solutions_id";
  ALTER TABLE "posts" DROP COLUMN "line";
  ALTER TABLE "posts_rels" DROP COLUMN "solutions_id";
  ALTER TABLE "_posts_v" DROP COLUMN "version_line";
  ALTER TABLE "_posts_v_rels" DROP COLUMN "solutions_id";
  DROP TYPE "public"."enum_industries_software_problems_icon";
  DROP TYPE "public"."enum_industries_software_module_map_icon";
  DROP TYPE "public"."enum_industries_line";
  DROP TYPE "public"."enum_industries_software_group";
  DROP TYPE "public"."enum_industries_software_wizard_firm";
  DROP TYPE "public"."enum_posts_line";
  DROP TYPE "public"."enum__posts_v_version_line";`)
}
