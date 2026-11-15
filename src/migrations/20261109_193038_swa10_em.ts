import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

/**
 * SWA10 (AUDYT-0911 wieczór #3) — data only, no schema change: the last Software H2 written in
 * the collections get their highlighted part in `**stars**`, as in the seed, for the databases
 * the seed no longer writes (staging, production). A cell changes only while it still holds the
 * old text exactly: a heading edited in the panel stays as it is. `down` swaps them back.
 */

type Change = { table: string; column: string; scope?: string; from: string; to: string }

const SOFTWARE_TENANTS = `SELECT "id" FROM "tenants" WHERE "line" = 'software'`

const SOLUTION_CONTACT = {
  from: 'Pokaż nam dzień ekipy, a wycenimy aplikację pod niego',
  to: 'Pokaż nam **dzień ekipy**, a wycenimy aplikację pod niego',
}

const CHANGES: Change[] = [
  { table: 'solutions', column: 'page_contact_title', ...SOLUTION_CONTACT },
  { table: '_solutions_v', column: 'version_page_contact_title', ...SOLUTION_CONTACT },
  {
    // Industries are shared by the lines: only the Software tenants.
    table: 'industries',
    column: 'software_page_contact_title',
    scope: `"tenant_id" IN (${SOFTWARE_TENANTS})`,
    from: 'Pokaż, jak dziś pracują Twoje ekipy',
    to: 'Pokaż, jak dziś pracują **Twoje ekipy**',
  },
  {
    table: 'cities',
    column: 'cta_title',
    from: 'Wpadnij do salonu przy Orkana 16B',
    to: 'Wpadnij do **salonu** przy Orkana 16B',
  },
]

async function swap(db: MigrateUpArgs['db'], back: boolean): Promise<void> {
  for (const { table, column, scope, from, to } of CHANGES) {
    const [oldText, newText] = back ? [to, from] : [from, to]
    // Static SQL for the names and the scope (no input); the texts are parameters.
    await db.execute(
      sql`UPDATE ${sql.identifier(table)} SET ${sql.identifier(column)} = ${newText} WHERE ${sql.identifier(column)} = ${oldText} AND ${sql.raw(scope ?? 'TRUE')}`,
    )
  }
}

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await swap(db, false)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await swap(db, true)
}
