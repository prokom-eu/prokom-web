import type { Payload } from 'payload'

import type { Page } from '../../payload-types'

export type PageBlock = NonNullable<Page['layout']>[number]
type Count = (name: string, result: boolean | 'updated') => void

const local = { overrideAccess: true, context: { seed: true }, depth: 0 } as const

/**
 * The layout to save, or `null` when nothing changes: a page without its Software block (missing,
 * or the generic sample page of `pnpm seed`) gets the seed layout; once the block is there the
 * page belongs to the panel (SW11a: `/kontakt`, `/cennik`, `/audyt`).
 */
export function softwarePageUpdate(
  layout: Page['layout'],
  block: PageBlock['blockType'],
  seed: () => PageBlock[],
): PageBlock[] | null {
  return (layout ?? []).some((item) => item.blockType === block) ? null : seed()
}

/** Creates the published page of the tenant, or replaces a page without its block. */
export async function upsertSoftwarePage(
  payload: Payload,
  tenantId: number,
  page: { slug: string; title: string; block: PageBlock['blockType']; layout: () => PageBlock[] },
  count: Count,
): Promise<void> {
  const {
    docs: [existing],
  } = await payload.find({
    collection: 'pages',
    where: { and: [{ tenant: { equals: tenantId } }, { slug: { equals: page.slug } }] },
    limit: 1,
    ...local,
  })
  if (!existing) {
    await payload.create({
      collection: 'pages',
      data: {
        tenant: tenantId,
        title: page.title,
        slug: page.slug,
        layout: page.layout(),
        _status: 'published',
      },
      ...local,
    })
    count(`pages ${page.slug}`, true)
    return
  }
  const layout = softwarePageUpdate(existing.layout, page.block, page.layout)
  count(`pages ${page.slug}`, layout ? 'updated' : false)
  if (!layout) return
  await payload.update({
    collection: 'pages',
    id: existing.id,
    data: { layout, _status: 'published' },
    ...local,
  })
}
