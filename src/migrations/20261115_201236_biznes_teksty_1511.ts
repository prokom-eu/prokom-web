import type { MigrateDownArgs, MigrateUpArgs } from '@payloadcms/db-postgres'
import type { Where } from 'payload'

import { FISCALIZATION_POST, replacePhrases, withReliefSource } from './data/biznes_teksty_1511'

/**
 * Audyt produkcji 15.11 wieczorem — data only, for the database the seed does not write (production
 * runs Biznes since 14.11; runbook §3a „Nowa treść z kodu dla linii, która już działa”). Exact
 * sentences of the live texts (`data/biznes_teksty_1511.ts`) changed through the Local API in the
 * Biznes tenants: the pages' blocks (home: „cztery linie”, „widzisz obok”), the posts' lead,
 * summary and content (the KSeF token, „3 dni od zgłoszenia”, the relief's notice, with its source
 * added to the fiscalization post) and the KSeF panel of the Biznes settings.
 * Versions: the published version is fixed as published; a newer draft written in the panel is
 * fixed too, as a draft (saved after, so it stays the latest the editor opens); a never published
 * post or page changes only as a draft. A record is saved only when it changed, a failed one is
 * logged and skipped (the deploy goes on). Legal pages keep their wording, as in the seed.
 * Databases already fixed by the seed change nothing. `down` keeps the texts (the old were wrong).
 */

type Args = Pick<MigrateUpArgs, 'payload' | 'req'>
type Payload = MigrateUpArgs['payload']

/** Pages whose wording is a legal text (`seed/biznes/textFixes.ts` → `LEGAL_SLUGS`). */
const LEGAL_SLUGS = new Set(['polityka-prywatnosci', 'cookies', 'dostepnosc', 'regulamin'])

const changed = (before: unknown, after: unknown) =>
  JSON.stringify(before) !== JSON.stringify(after)

async function biznesTenants({ payload, req }: Args) {
  const { docs } = await payload.find({
    collection: 'tenants',
    where: { line: { equals: 'biznes' } },
    limit: 10,
    req,
    overrideAccess: true,
    depth: 0,
  })
  return docs
}

type Doc = { id: number; slug?: string | null; _status?: 'draft' | 'published' | null }

/**
 * Fixes one versioned collection of a tenant: `fields` picks the texts of a document and returns
 * the data to save (or `null` when nothing changes).
 */
async function fixVersioned<T extends Doc>(
  payload: Payload,
  local: object,
  collection: 'pages' | 'posts',
  where: Where,
  fields: (doc: T) => Record<string, unknown> | null,
): Promise<number> {
  const find = (draft: boolean) =>
    payload.find({
      collection,
      where,
      limit: 0,
      pagination: false,
      draft,
      ...local,
    }) as unknown as Promise<{
      docs: T[]
    }>
  const [{ docs: main }, { docs: latest }] = await Promise.all([find(false), find(true)])
  const mainById = new Map(main.map((doc) => [doc.id, doc]))
  let saved = 0
  for (const doc of latest) {
    const stored = mainById.get(doc.id)
    const targets: [T, boolean][] = []
    // The published version first, then a newer draft — so the draft stays the latest one.
    if (stored?._status === 'published') targets.push([stored, false])
    if (doc._status === 'draft') targets.push([doc, true])
    for (const [version, draft] of targets) {
      const data = fields(version)
      if (!data) continue
      try {
        await payload.update({ collection, id: doc.id, data, draft, ...local })
        saved++
      } catch (error) {
        payload.logger.warn(
          `biznes_teksty_1511: ${collection} ${doc.id}${draft ? ' (draft)' : ''} skipped — ${String(error)}`,
        )
      }
    }
  }
  return saved
}

export async function up({ payload, req }: MigrateUpArgs): Promise<void> {
  // `seed`: no revalidation outside a Next.js request (the pages' cache expires on its own).
  const local = { req, overrideAccess: true, depth: 0, context: { seed: true } } as const
  let saved = 0
  for (const tenant of await biznesTenants({ payload, req })) {
    const inTenant = { tenant: { equals: tenant.id } }

    saved += await fixVersioned<Doc & { layout?: unknown }>(
      payload,
      local,
      'pages',
      inTenant,
      (page) => {
        if (page.slug && LEGAL_SLUGS.has(page.slug)) return null
        const layout = replacePhrases(page.layout)
        return changed(page.layout, layout) ? { layout } : null
      },
    )

    type PostTexts = Doc & {
      lead?: unknown
      summary?: unknown
      content?: unknown
      sources?: { url?: string | null }[] | null
    }
    saved += await fixVersioned<PostTexts>(payload, local, 'posts', inTenant, (post) => {
      const before = { lead: post.lead, summary: post.summary, content: post.content }
      const after = replacePhrases(before)
      const sources = post.slug === FISCALIZATION_POST ? withReliefSource(post.sources) : null
      if (!changed(before, after) && !sources) return null
      return { ...after, ...(sources && { sources }) }
    })

    const {
      docs: [settings],
    } = await payload.find({ collection: 'biznes-settings', where: inTenant, limit: 1, ...local })
    if (settings?.news?.ksef) {
      const ksef = replacePhrases(settings.news.ksef)
      if (changed(settings.news.ksef, ksef)) {
        await payload.update({
          collection: 'biznes-settings',
          id: settings.id,
          data: { news: { ...settings.news, ksef } },
          ...local,
        })
        saved++
      }
    }
  }
  payload.logger.info(`biznes_teksty_1511: ${saved} record(s) fixed.`)
}

export async function down(_args: MigrateDownArgs): Promise<void> {
  // The old sentences were wrong (the token, a term without a source): nothing to restore.
}
