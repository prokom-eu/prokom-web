import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_inquiries_status" AS ENUM('new', 'in_progress', 'closed');
  CREATE TYPE "public"."enum_inquiries_line" AS ENUM('prokom', 'biznes', 'instalacje', 'software');
  CREATE TYPE "public"."enum_inquiry_deletions_reason" AS ENUM('request', 'retention');
  CREATE TABLE "inquiries" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"tenant_id" integer,
  	"status" "enum_inquiries_status" DEFAULT 'new' NOT NULL,
  	"status_changed_at" timestamp(3) with time zone,
  	"line" "enum_inquiries_line" NOT NULL,
  	"category" varchar,
  	"name" varchar NOT NULL,
  	"company" varchar,
  	"nip" varchar,
  	"email" varchar,
  	"phone" varchar,
  	"message" varchar NOT NULL,
  	"source_url" varchar NOT NULL,
  	"source_utm_source" varchar,
  	"source_utm_medium" varchar,
  	"source_utm_campaign" varchar,
  	"consent_accepted" boolean DEFAULT false NOT NULL,
  	"consent_clause_version" varchar NOT NULL,
  	"consent_accepted_at" timestamp(3) with time zone NOT NULL,
  	"marketing_consent" boolean DEFAULT false,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "inquiry_deletions" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"inquiry_id" numeric NOT NULL,
  	"reason" "enum_inquiry_deletions_reason" NOT NULL,
  	"deleted_by_id" integer,
  	"deleted_by_email" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "inquiries_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "inquiry_deletions_id" integer;
  ALTER TABLE "inquiries" ADD CONSTRAINT "inquiries_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "inquiry_deletions" ADD CONSTRAINT "inquiry_deletions_deleted_by_id_users_id_fk" FOREIGN KEY ("deleted_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "inquiries_tenant_idx" ON "inquiries" USING btree ("tenant_id");
  CREATE INDEX "inquiries_status_idx" ON "inquiries" USING btree ("status");
  CREATE INDEX "inquiries_status_changed_at_idx" ON "inquiries" USING btree ("status_changed_at");
  CREATE INDEX "inquiries_line_idx" ON "inquiries" USING btree ("line");
  CREATE INDEX "inquiries_updated_at_idx" ON "inquiries" USING btree ("updated_at");
  CREATE INDEX "inquiries_created_at_idx" ON "inquiries" USING btree ("created_at");
  CREATE INDEX "inquiry_deletions_deleted_by_idx" ON "inquiry_deletions" USING btree ("deleted_by_id");
  CREATE INDEX "inquiry_deletions_updated_at_idx" ON "inquiry_deletions" USING btree ("updated_at");
  CREATE INDEX "inquiry_deletions_created_at_idx" ON "inquiry_deletions" USING btree ("created_at");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_inquiries_fk" FOREIGN KEY ("inquiries_id") REFERENCES "public"."inquiries"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_inquiry_deletions_fk" FOREIGN KEY ("inquiry_deletions_id") REFERENCES "public"."inquiry_deletions"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_inquiries_id_idx" ON "payload_locked_documents_rels" USING btree ("inquiries_id");
  CREATE INDEX "payload_locked_documents_rels_inquiry_deletions_id_idx" ON "payload_locked_documents_rels" USING btree ("inquiry_deletions_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  // Hand-ordered (the generator drops a constraint after `DROP TABLE … CASCADE` removed it):
  // the referencing columns first — their foreign keys and indexes go with them — then the tables.
  await db.execute(sql`
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "inquiries_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "inquiry_deletions_id";
  DROP TABLE "inquiries";
  DROP TABLE "inquiry_deletions";
  DROP TYPE "public"."enum_inquiries_status";
  DROP TYPE "public"."enum_inquiries_line";
  DROP TYPE "public"."enum_inquiry_deletions_reason";`)
}
