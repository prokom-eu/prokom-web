import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-postgres'

import { SOLUTIONS_V22 } from './data/software_solutions_v22'

/**
 * Software solutions v22 (ADR-014 „Rozstrzygnięcia v21/v22” pkt 1–4, 12; SWR1): one „od” price
 * and term instead of three sizes, levels for care and audit, texts of the offer window.
 *
 * Data, on the solutions table and on the versions table (`_solutions_v`, every version):
 * - `price_from` = the `start` price (else the lowest given); with levels — the lowest level;
 * - `lead_time` from the frozen map by slug („od 2 tygodni” cannot be derived from „2 tygodnie”);
 *   a slug outside the map gets „od ” + its `start` term. A term edited in the panel for a slug
 *   of the map is replaced: „od …” is the v22 wording of every term (ADR-014 SWR1 pkt 5);
 * - levels: names, descriptions and care reaction times from the map, prices (and audit terms)
 *   from the old size columns (start / std / full = level 1 / 2 / 3) — panel edits win;
 * - levels' comparison rows, „W cenie”, examples, „Przykład z życia”, related, thumbnail and the
 *   window overrides from the map — only where the field is still empty (panel edits stay);
 * - care texts: „Standard” → „Rozszerzona” (pkt 8).
 *
 * `down` is lossy: it brings back `prices.start` (care and audit: the three levels with their
 * names) and the `start` term without „od ”; the `std`/`full` prices of other solutions and the
 * care text change are not restored.
 */

type Target = {
  doc: string
  /** Column name in the document table (`version_…` in the versions table). */
  col: (name: string) => string
  texts: string
  rels: string
  /** Array table of a field. */
  array: (name: string) => string
  /** Path prefix of texts and relations (`version.` in the versions table). */
  prefix: string
  /** Id column of array rows and how to fill it (the main table has string ids). */
  arrayId: { column: string; value: string }
}

const RANDOM_ID = `substr(md5(random()::text || clock_timestamp()::text), 1, 24)`

const MAIN: Target = {
  doc: 'solutions',
  col: (name) => name,
  texts: 'solutions_texts',
  rels: 'solutions_rels',
  array: (name) => `solutions_${name}`,
  prefix: '',
  arrayId: { column: 'id', value: RANDOM_ID },
}

const VERSIONS: Target = {
  doc: '_solutions_v',
  col: (name) => `version_${name}`,
  texts: '_solutions_v_texts',
  rels: '_solutions_v_rels',
  array: (name) => `_solutions_v_version_${name}`,
  prefix: 'version.',
  arrayId: { column: '_uuid', value: RANDOM_ID },
}

type SQL = ReturnType<typeof sql>

const TEXT_FIELDS = ['included', 'moreExamples', 'benefits', 'needs'] as const
const CARE = 'opieka-nad-strona-i-systemem'

const raw = (value: string) => sql.raw(value)

/** The frozen map as rows `m(slug, d)`. */
const withMap = () =>
  sql`WITH m AS (SELECT key AS slug, value AS d FROM jsonb_each(${JSON.stringify(SOLUTIONS_V22)}::jsonb))`

function upData(t: Target): SQL[] {
  const doc = raw(`"${t.doc}"`)
  const c = (name: string) => raw(`"${t.col(name)}"`)
  const texts = raw(`"${t.texts}"`)
  const arr = (name: string) => raw(`"${t.array(name)}"`)
  const id = raw(`"${t.arrayId.column}"`)
  const newId = raw(t.arrayId.value)
  const path = (name: string) => `${t.prefix}${name}`
  const inMap = sql`FROM ${doc} s JOIN m ON m.slug = s.${c('slug')}`
  // Level n = the old size n (start / std / full): prices and audit terms edited in the panel win
  // over the map. Care terms („8 h roboczych”) had no column — they come from the map.
  const sizeOf = (group: string) =>
    sql`CASE x.ord WHEN 1 THEN s.${c(`${group}_start`)} WHEN 2 THEN s.${c(`${group}_std`)}
      WHEN 3 THEN s.${c(`${group}_full`)} END`

  return [
    sql`UPDATE ${doc} SET ${c('price_from')} = COALESCE(${c('prices_start')}, LEAST(${c('prices_std')}, ${c('prices_full')}))`,

    sql`${withMap()} UPDATE ${doc} s SET ${c('lead_time')} = CASE
      WHEN EXISTS (SELECT 1 FROM m WHERE m.slug = s.${c('slug')})
        THEN (SELECT m.d->>'leadTime' FROM m WHERE m.slug = s.${c('slug')})
      WHEN btrim(s.${c('lead_times_start')}) ~* '^od ' THEN btrim(s.${c('lead_times_start')})
      ELSE 'od ' || NULLIF(btrim(s.${c('lead_times_start')}), '') END`,

    sql`${withMap()} UPDATE ${doc} s SET
      ${c('thumbnail')} = COALESCE(NULLIF(s.${c('thumbnail')}, ''), m.d->>'thumbnail'),
      ${c('example')} = COALESCE(NULLIF(s.${c('example')}, ''), m.d->>'example')
      FROM m WHERE m.slug = s.${c('slug')}`,

    ...TEXT_FIELDS.map(
      (field) => sql`${withMap()} INSERT INTO ${texts} ("order", parent_id, path, text)
        SELECT x.ord, s.id, ${path(field)}, x.v ${inMap}
        CROSS JOIN LATERAL jsonb_array_elements_text(m.d->${field}) WITH ORDINALITY x(v, ord)
        WHERE NOT EXISTS (SELECT 1 FROM ${texts} t WHERE t.parent_id = s.id AND t.path = ${path(field)})`,
    ),

    sql`${withMap()} INSERT INTO ${arr('levels')}
        (_order, _parent_id, ${id}, name, short_name, price, term, recommended, description)
      SELECT x.ord, s.id, ${newId}, x.v->>'name', x.v->>'shortName',
        COALESCE(${sizeOf('prices')}, (x.v->>'price')::numeric),
        CASE WHEN s.${c('price_monthly')} THEN x.v->>'term'
          ELSE COALESCE(NULLIF(btrim(${sizeOf('lead_times')}), ''), x.v->>'term') END,
        (x.v->>'recommended')::boolean, x.v->>'description' ${inMap}
      CROSS JOIN LATERAL jsonb_array_elements(m.d->'levels') WITH ORDINALITY x(v, ord)
      WHERE NOT EXISTS (SELECT 1 FROM ${arr('levels')} l WHERE l._parent_id = s.id)`,

    sql`UPDATE ${doc} s SET ${c('price_from')} =
        (SELECT min(l.price) FROM ${arr('levels')} l WHERE l._parent_id = s.id)
      WHERE EXISTS (SELECT 1 FROM ${arr('levels')} l WHERE l._parent_id = s.id)`,

    sql`${withMap()} INSERT INTO ${texts} ("order", parent_id, path, text)
      SELECT y.ord, s.id, ${t.prefix} || 'levelRows.' || (x.ord - 1) || '.cells', y.v ${inMap}
      CROSS JOIN LATERAL jsonb_array_elements(m.d->'levelRows') WITH ORDINALITY x(v, ord)
      CROSS JOIN LATERAL jsonb_array_elements_text(x.v->'cells') WITH ORDINALITY y(v, ord)
      WHERE NOT EXISTS (SELECT 1 FROM ${arr('level_rows')} r WHERE r._parent_id = s.id)`,

    sql`${withMap()} INSERT INTO ${arr('level_rows')} (_order, _parent_id, ${id}, label)
      SELECT x.ord, s.id, ${newId}, x.v->>'label' ${inMap}
      CROSS JOIN LATERAL jsonb_array_elements(m.d->'levelRows') WITH ORDINALITY x(v, ord)
      WHERE NOT EXISTS (SELECT 1 FROM ${arr('level_rows')} r WHERE r._parent_id = s.id)`,

    sql`${withMap()} INSERT INTO ${arr('faq')} (_order, _parent_id, ${id}, q, a)
      SELECT x.ord, s.id, ${newId}, x.v->>'q', x.v->>'a' ${inMap}
      CROSS JOIN LATERAL jsonb_array_elements(m.d->'faq') WITH ORDINALITY x(v, ord)
      WHERE NOT EXISTS (SELECT 1 FROM ${arr('faq')} f WHERE f._parent_id = s.id)`,

    // Related solutions of the same tenant, by slug; a slug missing in the database is skipped.
    sql`${withMap()} INSERT INTO ${raw(`"${t.rels}"`)} ("order", parent_id, path, solutions_id)
      SELECT x.ord, s.id, ${path('related')}, r.id ${inMap}
      CROSS JOIN LATERAL jsonb_array_elements_text(m.d->'related') WITH ORDINALITY x(v, ord)
      JOIN "solutions" r ON r.slug = x.v AND r.tenant_id = s.${c('tenant_id')}
      WHERE NOT EXISTS (SELECT 1 FROM ${raw(`"${t.rels}"`)} t
        WHERE t.parent_id = s.id AND t.path = ${path('related')})`,

    sql`UPDATE ${doc} SET
        ${c('lead')} = replace(${c('lead')}, 'od poziomu Standard', 'od opieki Rozszerzonej'),
        ${c('price_note')} = replace(${c('price_note')}, 'Standard 299', 'Rozszerzona 299')
      WHERE ${c('slug')} = ${CARE}`,

    sql`UPDATE ${texts} t SET text = replace(t.text, 'od poziomu Standard', 'od opieki Rozszerzonej')
      FROM ${doc} s WHERE t.parent_id = s.id AND s.${c('slug')} = ${CARE}
        AND t.path = ${path('features')}`,
  ]
}

function downData(t: Target): SQL[] {
  const doc = raw(`"${t.doc}"`)
  const c = (name: string) => raw(`"${t.col(name)}"`)
  const levels = raw(`"${t.array('levels')}"`)
  const level = (order: number, column: string) =>
    sql`(SELECT l.${raw(column)} FROM ${levels} l WHERE l._parent_id = s.id AND l._order = ${order})`
  const textPaths = TEXT_FIELDS.map((field) => `${t.prefix}${field}`)

  return [
    sql`UPDATE ${doc} s SET ${c('prices_start')} = s.${c('price_from')},
      ${c('lead_times_start')} = NULLIF(regexp_replace(COALESCE(s.${c('lead_time')}, ''), '^od ', ''), '')`,

    sql`UPDATE ${doc} s SET
        ${c('prices_start')} = ${level(1, 'price')}, ${c('prices_std')} = ${level(2, 'price')},
        ${c('prices_full')} = ${level(3, 'price')},
        ${c('size_names_start')} = ${level(1, 'name')}, ${c('size_names_std')} = ${level(2, 'name')},
        ${c('size_names_full')} = ${level(3, 'name')},
        ${c('lead_times_start')} = CASE WHEN s.${c('price_monthly')} THEN NULL ELSE ${level(1, 'term')} END,
        ${c('lead_times_std')} = CASE WHEN s.${c('price_monthly')} THEN NULL ELSE ${level(2, 'term')} END,
        ${c('lead_times_full')} = CASE WHEN s.${c('price_monthly')} THEN NULL ELSE ${level(3, 'term')} END
      WHERE EXISTS (SELECT 1 FROM ${levels} l WHERE l._parent_id = s.id)`,

    sql`DELETE FROM ${raw(`"${t.texts}"`)}
      WHERE path IN (${sql.join(
        textPaths.map((p) => sql`${p}`),
        sql`, `,
      )})
        OR path LIKE ${`${t.prefix}levelRows.%`}`,
  ]
}

async function run(db: MigrateUpArgs['db'], statements: SQL[]) {
  for (const statement of statements) await db.execute(statement)
}

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "solutions_levels" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"short_name" varchar,
  	"price" numeric,
  	"term" varchar,
  	"recommended" boolean DEFAULT false,
  	"description" varchar
  );
  
  CREATE TABLE "solutions_level_rows" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar
  );
  
  CREATE TABLE "solutions_faq" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"q" varchar,
  	"a" varchar
  );
  
  CREATE TABLE "solutions_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"solutions_id" integer
  );
  
  CREATE TABLE "_solutions_v_version_levels" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"short_name" varchar,
  	"price" numeric,
  	"term" varchar,
  	"recommended" boolean DEFAULT false,
  	"description" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_solutions_v_version_level_rows" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_solutions_v_version_faq" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"q" varchar,
  	"a" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_solutions_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"solutions_id" integer
  );
  
  ALTER TABLE "solutions" ADD COLUMN "price_from" numeric;
  ALTER TABLE "solutions" ADD COLUMN "lead_time" varchar;
  ALTER TABLE "solutions" ADD COLUMN "thumbnail" varchar;
  ALTER TABLE "solutions" ADD COLUMN "example" varchar;
  ALTER TABLE "_solutions_v" ADD COLUMN "version_price_from" numeric;
  ALTER TABLE "_solutions_v" ADD COLUMN "version_lead_time" varchar;
  ALTER TABLE "_solutions_v" ADD COLUMN "version_thumbnail" varchar;
  ALTER TABLE "_solutions_v" ADD COLUMN "version_example" varchar;
  ALTER TABLE "solutions_levels" ADD CONSTRAINT "solutions_levels_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."solutions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "solutions_level_rows" ADD CONSTRAINT "solutions_level_rows_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."solutions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "solutions_faq" ADD CONSTRAINT "solutions_faq_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."solutions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "solutions_rels" ADD CONSTRAINT "solutions_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."solutions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "solutions_rels" ADD CONSTRAINT "solutions_rels_solutions_fk" FOREIGN KEY ("solutions_id") REFERENCES "public"."solutions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_solutions_v_version_levels" ADD CONSTRAINT "_solutions_v_version_levels_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_solutions_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_solutions_v_version_level_rows" ADD CONSTRAINT "_solutions_v_version_level_rows_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_solutions_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_solutions_v_version_faq" ADD CONSTRAINT "_solutions_v_version_faq_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_solutions_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_solutions_v_rels" ADD CONSTRAINT "_solutions_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_solutions_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_solutions_v_rels" ADD CONSTRAINT "_solutions_v_rels_solutions_fk" FOREIGN KEY ("solutions_id") REFERENCES "public"."solutions"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "solutions_levels_order_idx" ON "solutions_levels" USING btree ("_order");
  CREATE INDEX "solutions_levels_parent_id_idx" ON "solutions_levels" USING btree ("_parent_id");
  CREATE INDEX "solutions_level_rows_order_idx" ON "solutions_level_rows" USING btree ("_order");
  CREATE INDEX "solutions_level_rows_parent_id_idx" ON "solutions_level_rows" USING btree ("_parent_id");
  CREATE INDEX "solutions_faq_order_idx" ON "solutions_faq" USING btree ("_order");
  CREATE INDEX "solutions_faq_parent_id_idx" ON "solutions_faq" USING btree ("_parent_id");
  CREATE INDEX "solutions_rels_order_idx" ON "solutions_rels" USING btree ("order");
  CREATE INDEX "solutions_rels_parent_idx" ON "solutions_rels" USING btree ("parent_id");
  CREATE INDEX "solutions_rels_path_idx" ON "solutions_rels" USING btree ("path");
  CREATE INDEX "solutions_rels_solutions_id_idx" ON "solutions_rels" USING btree ("solutions_id");
  CREATE INDEX "_solutions_v_version_levels_order_idx" ON "_solutions_v_version_levels" USING btree ("_order");
  CREATE INDEX "_solutions_v_version_levels_parent_id_idx" ON "_solutions_v_version_levels" USING btree ("_parent_id");
  CREATE INDEX "_solutions_v_version_level_rows_order_idx" ON "_solutions_v_version_level_rows" USING btree ("_order");
  CREATE INDEX "_solutions_v_version_level_rows_parent_id_idx" ON "_solutions_v_version_level_rows" USING btree ("_parent_id");
  CREATE INDEX "_solutions_v_version_faq_order_idx" ON "_solutions_v_version_faq" USING btree ("_order");
  CREATE INDEX "_solutions_v_version_faq_parent_id_idx" ON "_solutions_v_version_faq" USING btree ("_parent_id");
  CREATE INDEX "_solutions_v_rels_order_idx" ON "_solutions_v_rels" USING btree ("order");
  CREATE INDEX "_solutions_v_rels_parent_idx" ON "_solutions_v_rels" USING btree ("parent_id");
  CREATE INDEX "_solutions_v_rels_path_idx" ON "_solutions_v_rels" USING btree ("path");
  CREATE INDEX "_solutions_v_rels_solutions_id_idx" ON "_solutions_v_rels" USING btree ("solutions_id");
`)

  await run(db, [...upData(MAIN), ...upData(VERSIONS)])

  await db.execute(sql`
  ALTER TABLE "solutions" DROP COLUMN "prices_start";
  ALTER TABLE "solutions" DROP COLUMN "prices_std";
  ALTER TABLE "solutions" DROP COLUMN "prices_full";
  ALTER TABLE "solutions" DROP COLUMN "size_names_start";
  ALTER TABLE "solutions" DROP COLUMN "size_names_std";
  ALTER TABLE "solutions" DROP COLUMN "size_names_full";
  ALTER TABLE "solutions" DROP COLUMN "lead_times_start";
  ALTER TABLE "solutions" DROP COLUMN "lead_times_std";
  ALTER TABLE "solutions" DROP COLUMN "lead_times_full";
  ALTER TABLE "_solutions_v" DROP COLUMN "version_prices_start";
  ALTER TABLE "_solutions_v" DROP COLUMN "version_prices_std";
  ALTER TABLE "_solutions_v" DROP COLUMN "version_prices_full";
  ALTER TABLE "_solutions_v" DROP COLUMN "version_size_names_start";
  ALTER TABLE "_solutions_v" DROP COLUMN "version_size_names_std";
  ALTER TABLE "_solutions_v" DROP COLUMN "version_size_names_full";
  ALTER TABLE "_solutions_v" DROP COLUMN "version_lead_times_start";
  ALTER TABLE "_solutions_v" DROP COLUMN "version_lead_times_std";
  ALTER TABLE "_solutions_v" DROP COLUMN "version_lead_times_full";
`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
  ALTER TABLE "solutions" ADD COLUMN "prices_start" numeric;
  ALTER TABLE "solutions" ADD COLUMN "prices_std" numeric;
  ALTER TABLE "solutions" ADD COLUMN "prices_full" numeric;
  ALTER TABLE "solutions" ADD COLUMN "size_names_start" varchar;
  ALTER TABLE "solutions" ADD COLUMN "size_names_std" varchar;
  ALTER TABLE "solutions" ADD COLUMN "size_names_full" varchar;
  ALTER TABLE "solutions" ADD COLUMN "lead_times_start" varchar;
  ALTER TABLE "solutions" ADD COLUMN "lead_times_std" varchar;
  ALTER TABLE "solutions" ADD COLUMN "lead_times_full" varchar;
  ALTER TABLE "_solutions_v" ADD COLUMN "version_prices_start" numeric;
  ALTER TABLE "_solutions_v" ADD COLUMN "version_prices_std" numeric;
  ALTER TABLE "_solutions_v" ADD COLUMN "version_prices_full" numeric;
  ALTER TABLE "_solutions_v" ADD COLUMN "version_size_names_start" varchar;
  ALTER TABLE "_solutions_v" ADD COLUMN "version_size_names_std" varchar;
  ALTER TABLE "_solutions_v" ADD COLUMN "version_size_names_full" varchar;
  ALTER TABLE "_solutions_v" ADD COLUMN "version_lead_times_start" varchar;
  ALTER TABLE "_solutions_v" ADD COLUMN "version_lead_times_std" varchar;
  ALTER TABLE "_solutions_v" ADD COLUMN "version_lead_times_full" varchar;
`)

  await run(db, [...downData(MAIN), ...downData(VERSIONS)])

  await db.execute(sql`
  DROP TABLE "solutions_levels" CASCADE;
  DROP TABLE "solutions_level_rows" CASCADE;
  DROP TABLE "solutions_faq" CASCADE;
  DROP TABLE "solutions_rels" CASCADE;
  DROP TABLE "_solutions_v_version_levels" CASCADE;
  DROP TABLE "_solutions_v_version_level_rows" CASCADE;
  DROP TABLE "_solutions_v_version_faq" CASCADE;
  DROP TABLE "_solutions_v_rels" CASCADE;
  ALTER TABLE "solutions" DROP COLUMN "price_from";
  ALTER TABLE "solutions" DROP COLUMN "lead_time";
  ALTER TABLE "solutions" DROP COLUMN "thumbnail";
  ALTER TABLE "solutions" DROP COLUMN "example";
  ALTER TABLE "_solutions_v" DROP COLUMN "version_price_from";
  ALTER TABLE "_solutions_v" DROP COLUMN "version_lead_time";
  ALTER TABLE "_solutions_v" DROP COLUMN "version_thumbnail";
  ALTER TABLE "_solutions_v" DROP COLUMN "version_example";
`)
}
