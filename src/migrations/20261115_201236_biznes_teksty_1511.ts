import type { MigrateDownArgs, MigrateUpArgs } from '@payloadcms/db-postgres'

import { replacePhrases } from './data/biznes_teksty_1511'

/**
 * Audyt produkcji 15.11 wieczorem — data only, for the database the seed does not write (production
 * runs Biznes since 14.11; runbook §3a „Nowa treść z kodu dla linii, która już działa”). Exact
 * sentences of the live texts (`data/biznes_teksty_1511.ts`) changed through the Local API in the
 * Biznes tenants: the pages' blocks (home: „cztery linie”, „widzisz obok”), the posts' lead,
 * summary and content (the KSeF token, „3 dni od zgłoszenia”, the relief's notice) and the KSeF
 * panel of the Biznes settings. A record is saved only when it changed; a text edited in the panel
 * keeps everything but these sentences. Databases already fixed by the seed change nothing.
 * `down` keeps the texts (the old ones were wrong).
 */

type Args = Pick<MigrateUpArgs, 'payload' | 'req'>

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

export async function up({ payload, req }: MigrateUpArgs): Promise<void> {
  // `seed`: no revalidation outside a Next.js request (the pages' cache expires on its own).
  const local = { req, overrideAccess: true, depth: 0, context: { seed: true } } as const
  let saved = 0
  for (const tenant of await biznesTenants({ payload, req })) {
    const inTenant = { tenant: { equals: tenant.id } }

    const pages = await payload.find({
      collection: 'pages',
      where: inTenant,
      limit: 0,
      pagination: false,
      ...local,
    })
    for (const page of pages.docs) {
      const layout = replacePhrases(page.layout)
      if (!changed(page.layout, layout)) continue
      await payload.update({ collection: 'pages', id: page.id, data: { layout }, ...local })
      saved++
    }

    const posts = await payload.find({
      collection: 'posts',
      where: inTenant,
      limit: 0,
      pagination: false,
      ...local,
    })
    for (const post of posts.docs) {
      const before = { lead: post.lead, summary: post.summary, content: post.content }
      const after = replacePhrases(before)
      if (!changed(before, after)) continue
      await payload.update({ collection: 'posts', id: post.id, data: after, ...local })
      saved++
    }

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
