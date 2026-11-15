import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

/**
 * SWV6 A1 — data only, no schema change: the saved Software navigation (`site_settings.
 * software_navigation`) loses its links to the industries index `/dla-branz` (no page) and to
 * industry pages that are not active in that tenant (404): mega menu chips, „Dla branż” in the
 * phone menu and in the footer; the footer card of the service line becomes „Serwis” (not „Tech”). Links are `[label, href, …]` tuples wherever they sit. The same
 * rule as `src/lib/software/industryLinks.ts` (kept here as is, so the migration never changes).
 * `down` restores nothing: the removed links led to 404 pages; an industry switched on later gets
 * its link back in the panel.
 */

const INDEX = '/dla-branz'

function dead(href: string, active: Set<string>): boolean {
  if (href === INDEX) return true
  if (!href.startsWith(`${INDEX}/`)) return false
  return !active.has(href.slice(INDEX.length + 1).split(/[?#]/)[0] ?? '')
}

function clean(value: unknown, active: Set<string>): unknown {
  if (Array.isArray(value)) {
    return value
      .filter(
        (item) => !(Array.isArray(item) && typeof item[1] === 'string' && dead(item[1], active)),
      )
      .map((item) => clean(item, active))
  }
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [key, clean(item, active)]),
    )
  }
  return value
}

/** The footer card of the service line: „Serwis”, not „Tech” (colour key `tech` stays). */
function serviceLine(navigation: unknown): unknown {
  if (!navigation || typeof navigation !== 'object') return navigation
  const footer = (navigation as { footer?: { lines?: unknown } }).footer
  if (!footer || !Array.isArray(footer.lines)) return navigation
  const lines = footer.lines.map((card: unknown) =>
    card && typeof card === 'object' && (card as { color?: unknown }).color === 'tech'
      ? { ...card, name: 'Serwis', label: 'SERWIS' }
      : card,
  )
  return { ...navigation, footer: { ...footer, lines } }
}

type Row = { id: number; tenant_id: number | null; software_navigation: unknown }

export async function up({ db }: MigrateUpArgs): Promise<void> {
  const { rows } = await db.execute(sql`
    SELECT "id", "tenant_id", "software_navigation" FROM "site_settings"
    WHERE "software_navigation" IS NOT NULL`)
  for (const row of rows as Row[]) {
    const { rows: industries } = await db.execute(sql`
      SELECT "slug" FROM "industries" WHERE "tenant_id" = ${row.tenant_id} AND "active" = true`)
    const active = new Set((industries as { slug: string }[]).map((item) => item.slug))
    const before = row.software_navigation
    const after = serviceLine(clean(before, active))
    if (JSON.stringify(after) === JSON.stringify(before)) continue
    await db.execute(sql`
      UPDATE "site_settings" SET "software_navigation" = ${JSON.stringify(after)}::jsonb
      WHERE "id" = ${row.id}`)
  }
}

export async function down(_args: MigrateDownArgs): Promise<void> {
  // Nothing to restore (see above).
}
