import type { Payload } from 'payload'

import type { Page } from '../../payload-types'
import { nextDescription } from './description'
import { mergeHomeLayout } from './home'
import { backupLayout, describeLayout, hasSeedLayout, pagesToReplace } from './replacePages'

export type PageBlock = NonNullable<Page['layout']>[number]

type Report = (name: string, changed: boolean) => void
type Note = (what: string, item: string) => void

const local = { overrideAccess: true, context: { seed: true }, depth: 0 } as const

type SeedPage = {
  slug: string
  title: string
  layout: PageBlock[]
  /**
   * SEO → Opis: set on create, and later only while the page has none or still an earlier seed
   * wording (`replaces`) — a description written in the panel stays.
   */
  description?: string
  replaces?: readonly string[]
  /** SEO → Tytuł: set on create only (a title from the panel stays). */
  seoTitle?: string
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
  note?: Note,
): Promise<boolean> {
  const {
    docs: [found],
  } = await payload.find({
    collection: 'pages',
    where: { and: [{ tenant: { equals: tenantId } }, { slug: { equals: page.slug } }] },
    limit: 1,
    ...local,
  })
  // NAPRAWA-0911: a named page gets the seed's layout even when it looks edited (replacePages).
  const replace =
    found && pagesToReplace().has(page.slug) && !hasSeedLayout(found.layout, page.layout)
  if (replace) {
    const file = backupLayout(page.slug, found.layout)
    await payload.update({
      collection: 'pages',
      id: found.id,
      data: { layout: page.layout, _status: 'published' },
      ...local,
    })
    report(`pages ${page.slug} replaced`, true)
    note?.(
      'strona zamieniona (przed → po)',
      `${page.slug}: ${describeLayout(found.layout)} → ${describeLayout(page.layout)}; kopia ${file}`,
    )
    // Now a K4 page: the usual rules below also bring its SEO description up to date.
  }
  if (found && !replace && !found.layout?.some((block) => block.blockType === 'bzSection')) {
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
  { slug, title, layout: seed, description, replaces, seoTitle }: SeedPage,
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
        ...((description || seoTitle) && {
          seo: { ...(description && { description }), ...(seoTitle && { title: seoTitle }) },
        }),
        tenant: tenantId,
        _status: 'published',
      },
      ...local,
    })
    report(`pages ${slug}`, true)
    return
  }
  const layout = mergeHomeLayout(page.layout, seed)
  const seo = nextDescription(page.seo?.description, description, replaces)
  report(`pages ${slug}`, layout !== null || seo !== null)
  if (layout || seo) {
    await payload.update({
      collection: 'pages',
      id: page.id,
      data: {
        ...(layout && { layout, _status: 'published' as const }),
        ...(seo && { seo: { ...page.seo, description: seo } }),
      },
      ...local,
    })
  }
}
