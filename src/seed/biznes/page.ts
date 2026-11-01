import type { Payload } from 'payload'

import type { Page } from '../../payload-types'
import { mergeHomeLayout } from './home'

export type PageBlock = NonNullable<Page['layout']>[number]

type Report = (name: string, changed: boolean) => void

const local = { overrideAccess: true, context: { seed: true }, depth: 0 } as const

type SeedPage = {
  slug: string
  title: string
  layout: PageBlock[]
  /** SEO → Opis, set only when the page is created (later it belongs to the panel). */
  description?: string
}

/**
 * A K4 page (K4hij): created when missing; a page already on K4 sections only gains missing
 * block types. Any other page was edited in the panel: it is left alone and returned as
 * `false` for the seed report. (The B9 layouts it used to replace went with their blocks.)
 */
export async function upsertK4Page(
  payload: Payload,
  tenantId: number,
  page: SeedPage,
  report: Report,
): Promise<boolean> {
  const {
    docs: [found],
  } = await payload.find({
    collection: 'pages',
    where: { and: [{ tenant: { equals: tenantId } }, { slug: { equals: page.slug } }] },
    limit: 1,
    ...local,
  })
  if (found && !found.layout?.some((block) => block.blockType === 'bzSection')) {
    report(`pages ${page.slug}`, false)
    return false
  }
  await upsertBiznesPage(payload, tenantId, page, report)
  return true
}

/**
 * A Biznes page from blocks (legal pages, K4 pages): created and published when missing;
 * otherwise only block types it lacks are added (`mergeHomeLayout`) — blocks edited in the
 * panel are never overwritten. Reports `pages <slug>`.
 */
export async function upsertBiznesPage(
  payload: Payload,
  tenantId: number,
  { slug, title, layout: seed, description }: SeedPage,
  report: Report,
): Promise<void> {
  const {
    docs: [page],
  } = await payload.find({
    collection: 'pages',
    where: { and: [{ tenant: { equals: tenantId } }, { slug: { equals: slug } }] },
    limit: 1,
    ...local,
  })
  if (!page) {
    await payload.create({
      collection: 'pages',
      data: {
        title,
        slug,
        layout: seed,
        ...(description ? { seo: { description } } : {}),
        tenant: tenantId,
        _status: 'published',
      },
      ...local,
    })
    report(`pages ${slug}`, true)
    return
  }
  const layout = mergeHomeLayout(page.layout, seed)
  report(`pages ${slug}`, layout !== null)
  if (layout) {
    await payload.update({
      collection: 'pages',
      id: page.id,
      data: { layout, _status: 'published' },
      ...local,
    })
  }
}
