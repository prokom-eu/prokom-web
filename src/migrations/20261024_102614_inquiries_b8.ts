import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

// B8: `city` (Miejscowość, plansza Zapytanie), WhatsApp instead of „Obojętnie” in the preferred
// contact, an optional message (notes of the inquiry list) and the success text of `bzContact`.
// Generated, plus the data steps that keep existing rows castable to the new enum and NOT NULL.

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "inquiries" ALTER COLUMN "preferred_contact" SET DATA TYPE text;
  UPDATE "inquiries" SET "preferred_contact" = NULL WHERE "preferred_contact" = 'any';
  DROP TYPE "public"."enum_inquiries_preferred_contact";
  CREATE TYPE "public"."enum_inquiries_preferred_contact" AS ENUM('phone', 'whatsapp', 'email');
  ALTER TABLE "inquiries" ALTER COLUMN "preferred_contact" SET DATA TYPE "public"."enum_inquiries_preferred_contact" USING "preferred_contact"::"public"."enum_inquiries_preferred_contact";
  ALTER TABLE "inquiries" ALTER COLUMN "message" DROP NOT NULL;
  ALTER TABLE "pages_blocks_bz_contact" ADD COLUMN "success_text" varchar;
  ALTER TABLE "_pages_v_blocks_bz_contact" ADD COLUMN "success_text" varchar;
  ALTER TABLE "inquiries" ADD COLUMN "city" varchar;`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "inquiries" ALTER COLUMN "preferred_contact" SET DATA TYPE text;
  UPDATE "inquiries" SET "preferred_contact" = 'phone' WHERE "preferred_contact" = 'whatsapp';
  DROP TYPE "public"."enum_inquiries_preferred_contact";
  CREATE TYPE "public"."enum_inquiries_preferred_contact" AS ENUM('phone', 'email', 'any');
  ALTER TABLE "inquiries" ALTER COLUMN "preferred_contact" SET DATA TYPE "public"."enum_inquiries_preferred_contact" USING "preferred_contact"::"public"."enum_inquiries_preferred_contact";
  UPDATE "inquiries" SET "message" = '' WHERE "message" IS NULL;
  ALTER TABLE "inquiries" ALTER COLUMN "message" SET NOT NULL;
  ALTER TABLE "pages_blocks_bz_contact" DROP COLUMN "success_text";
  ALTER TABLE "_pages_v_blocks_bz_contact" DROP COLUMN "success_text";
  ALTER TABLE "inquiries" DROP COLUMN "city";`)
}
