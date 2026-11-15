import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TYPE "public"."enum_inquiries_type" ADD VALUE 'audit';
  ALTER TYPE "public"."enum_inquiries_preferred_contact" ADD VALUE 'meeting';
  ALTER TYPE "public"."enum_inquiries_preferred_contact" ADD VALUE 'online';
  ALTER TABLE "inquiries_items" ADD COLUMN "solution_id" integer;
  ALTER TABLE "inquiries" ADD COLUMN "audit_url" varchar;
  ALTER TABLE "inquiries_items" ADD CONSTRAINT "inquiries_items_solution_id_solutions_id_fk" FOREIGN KEY ("solution_id") REFERENCES "public"."solutions"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "inquiries_items_solution_idx" ON "inquiries_items" USING btree ("solution_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  // The old enums lack the Software values. Inquiries are kept (local databases only): an audit
  // becomes a contact (its message names the site), a meeting or online call loses the choice.
  await db.execute(sql`
  UPDATE "inquiries" SET "type" = 'contact' WHERE "type"::text = 'audit';
  UPDATE "inquiries" SET "preferred_contact" = NULL
    WHERE "preferred_contact"::text IN ('meeting', 'online');`)
  await db.execute(sql`
   ALTER TABLE "inquiries_items" DROP CONSTRAINT "inquiries_items_solution_id_solutions_id_fk";
  
  ALTER TABLE "inquiries" ALTER COLUMN "type" SET DATA TYPE text;
  ALTER TABLE "inquiries" ALTER COLUMN "type" SET DEFAULT 'contact'::text;
  DROP TYPE "public"."enum_inquiries_type";
  CREATE TYPE "public"."enum_inquiries_type" AS ENUM('contact', 'list', 'wizard', 'search');
  ALTER TABLE "inquiries" ALTER COLUMN "type" SET DEFAULT 'contact'::"public"."enum_inquiries_type";
  ALTER TABLE "inquiries" ALTER COLUMN "type" SET DATA TYPE "public"."enum_inquiries_type" USING "type"::"public"."enum_inquiries_type";
  ALTER TABLE "inquiries" ALTER COLUMN "preferred_contact" SET DATA TYPE text;
  DROP TYPE "public"."enum_inquiries_preferred_contact";
  CREATE TYPE "public"."enum_inquiries_preferred_contact" AS ENUM('phone', 'whatsapp', 'email');
  ALTER TABLE "inquiries" ALTER COLUMN "preferred_contact" SET DATA TYPE "public"."enum_inquiries_preferred_contact" USING "preferred_contact"::"public"."enum_inquiries_preferred_contact";
  DROP INDEX "inquiries_items_solution_idx";
  ALTER TABLE "inquiries_items" DROP COLUMN "solution_id";
  ALTER TABLE "inquiries" DROP COLUMN "audit_url";`)
}
