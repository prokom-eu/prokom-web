import type { MigrateDownArgs, MigrateUpArgs } from '@payloadcms/db-postgres'

import { CITIES_SEO_2, SOLUTION_PAGES_SEO_2 } from './data/software_tresc_seo_2'

/**
 * SEO etap 2 (Software) — data only, for the databases the seed does not write: production runs
 * since 9.11, so a line's texts cannot come by the staging copy any more (runbook §3a „Kolejna
 * linia później”). Through the Local API, as the seed writes them (versions, arrays, relations):
 * - the town pages of Nowy Targ, Mszana Dolna, Limanowa and Nowy Sącz (PR #573) — only while the
 *   town is inactive and has no page (a page written in the panel stays); the solutions of the
 *   cards are found by slug in the tenant, a town with a missing one is left out (logged);
 * - the page texts of 8 solutions (PR #576) — only while the page lead is empty (the template).
 * Databases with the seed already applied (local, staging) change nothing. `down` keeps the texts:
 * it only hides the four towns again (their pages 404 as before), the solution texts stay.
 */

const TOWNS = Object.keys(CITIES_SEO_2) as (keyof typeof CITIES_SEO_2)[]

export async function up({ payload, req }: MigrateUpArgs): Promise<void> {
  // `seed`: no revalidation outside a Next.js request (lib/software/revalidate.ts).
  const local = { req, overrideAccess: true, depth: 0, context: { seed: true } } as const
  const { docs: tenants } = await payload.find({
    collection: 'tenants',
    where: { line: { equals: 'software' } },
    limit: 10,
    ...local,
  })

  for (const tenant of tenants) {
    const inTenant = { tenant: { equals: tenant.id } }

    const { docs: solutions } = await payload.find({
      collection: 'solutions',
      where: inTenant,
      limit: 500,
      ...local,
    })
    const solutionId = new Map(solutions.map((doc) => [doc.slug, doc.id]))

    for (const slug of TOWNS) {
      const {
        docs: [city],
      } = await payload.find({
        collection: 'cities',
        where: { and: [inTenant, { slug: { equals: slug } }] },
        limit: 1,
        ...local,
      })
      if (city && (city.active || city.hero?.title)) continue
      const data = CITIES_SEO_2[slug]
      const missing = data.who.items.filter((card) => !solutionId.has(card.solution))
      if (missing.length) {
        payload.logger.warn(
          `software_tresc_seo_2: ${slug} skipped, no solution ${missing.map((card) => card.solution).join(', ')}.`,
        )
        continue
      }
      const cityData = {
        ...data,
        hero: { ...data.hero, ctas: [...data.hero.ctas] },
        who: {
          ...data.who,
          items: data.who.items.map((card) => ({
            ...card,
            solution: solutionId.get(card.solution)!,
          })),
        },
        local: { ...data.local, items: [...data.local.items] },
        faq: [...data.faq],
        nearby: [...data.nearby],
        cta: { ...data.cta, buttons: [...data.cta.buttons] },
      }
      if (city) {
        await payload.update({ collection: 'cities', id: city.id, data: cityData, ...local })
      } else {
        await payload.create({
          collection: 'cities',
          data: { ...cityData, tenant: tenant.id },
          ...local,
        })
      }
    }

    for (const [slug, texts] of Object.entries(SOLUTION_PAGES_SEO_2)) {
      const solution = solutions.find((doc) => doc.slug === slug)
      if (!solution || solution.page?.lead) continue
      await payload.update({
        collection: 'solutions',
        id: solution.id,
        data: {
          page: {
            ...texts,
            compare: texts.compare.map((item) => ({ ...item })),
            faq: texts.faq.map((item) => ({ ...item })),
            contact: { ...texts.contact },
          },
          _status: 'published',
        },
        ...local,
      })
    }
  }
}

export async function down({ payload, req }: MigrateDownArgs): Promise<void> {
  const local = { req, overrideAccess: true, depth: 0, context: { seed: true } } as const
  await payload.update({
    collection: 'cities',
    where: { slug: { in: TOWNS } },
    data: { active: false },
    ...local,
  })
}
