import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

// D10 (06.11.2026): no WhatsApp on any line. Drops the WhatsApp number of Biznes and Instalacje
// (data removed — Krystian's consent 06.11) and the `whatsapp` preferred contact of inquiries:
// existing rows become `phone` (decision 08.11), so they stay castable to the new enum.
// `down` brings the columns and the enum value back, without the data and the old texts.

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "inquiries" ALTER COLUMN "preferred_contact" SET DATA TYPE text;
  UPDATE "inquiries" SET "preferred_contact" = 'phone' WHERE "preferred_contact" = 'whatsapp';
  DROP TYPE "public"."enum_inquiries_preferred_contact";
  CREATE TYPE "public"."enum_inquiries_preferred_contact" AS ENUM('phone', 'email', 'meeting', 'online');
  ALTER TABLE "inquiries" ALTER COLUMN "preferred_contact" SET DATA TYPE "public"."enum_inquiries_preferred_contact" USING "preferred_contact"::"public"."enum_inquiries_preferred_contact";
  ALTER TABLE "site_settings" DROP COLUMN "biznes_whatsapp";
  ALTER TABLE "instalacje_settings" DROP COLUMN "whatsapp";`)

  // Texts the seed wrote before D10 and never overwrites: the /kontakt descriptions of Biznes
  // and Instalacje and one sentence of the Instalacje privacy policy. Only the exact seed
  // wording is replaced — a text changed in the panel stays as it is. Versions too.
  await db.execute(sql`
  UPDATE "pages" SET "seo_description" = replace(replace("seo_description",
    'Telefon, WhatsApp, e-mail', 'Telefon, e-mail'), 'telefon, WhatsApp, e-mail', 'telefon, e-mail')
    WHERE "seo_description" LIKE '%, WhatsApp, e-mail%';
  UPDATE "_pages_v" SET "version_seo_description" = replace(replace("version_seo_description",
    'Telefon, WhatsApp, e-mail', 'Telefon, e-mail'), 'telefon, WhatsApp, e-mail', 'telefon, e-mail')
    WHERE "version_seo_description" LIKE '%, WhatsApp, e-mail%';
  UPDATE "pages_blocks_rich_text" SET "content" = replace("content"::text,
    'Jeśli napiszesz do nas przez WhatsApp albo otworzysz trasę w Mapach Google, korzystasz z usług tych firm na ich zasadach — strona tylko otwiera ich aplikację.',
    'Jeśli otworzysz trasę w Mapach Google, korzystasz z usług tej firmy na jej zasadach — strona tylko otwiera jej aplikację.')::jsonb
    WHERE "content"::text LIKE '%napiszesz do nas przez WhatsApp%';
  UPDATE "_pages_v_blocks_rich_text" SET "content" = replace("content"::text,
    'Jeśli napiszesz do nas przez WhatsApp albo otworzysz trasę w Mapach Google, korzystasz z usług tych firm na ich zasadach — strona tylko otwiera ich aplikację.',
    'Jeśli otworzysz trasę w Mapach Google, korzystasz z usług tej firmy na jej zasadach — strona tylko otwiera jej aplikację.')::jsonb
    WHERE "content"::text LIKE '%napiszesz do nas przez WhatsApp%';`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TYPE "public"."enum_inquiries_preferred_contact" ADD VALUE 'whatsapp' BEFORE 'email';
  ALTER TABLE "site_settings" ADD COLUMN "biznes_whatsapp" varchar;
  ALTER TABLE "instalacje_settings" ADD COLUMN "whatsapp" varchar;`)
}
