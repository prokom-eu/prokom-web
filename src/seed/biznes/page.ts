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

/** Block types of a layout, in order: the fingerprint of a seeded page. */
const typesOf = (layout: Page['layout']) => (layout ?? []).map((block) => block.blockType).join(',')

/** Every text of a value (ids and numbers — media, products — left out). */
function textsOf(value: unknown, out = new Set<string>()): Set<string> {
  if (typeof value === 'string') out.add(value)
  else if (Array.isArray(value)) for (const item of value) textsOf(item, out)
  else if (value && typeof value === 'object') {
    for (const [key, item] of Object.entries(value)) if (key !== 'id') textsOf(item, out)
  }
  return out
}

/**
 * The page still holds an older seed: the same block types in the same order, and every text of
 * that seed is still there (the database adds defaults, so only „seed ⊆ page” is checked). A text
 * changed in the panel breaks it, and the page is left alone.
 */
export function isSeedLayout(current: Page['layout'], seed: readonly PageBlock[]): boolean {
  if (typesOf(current) !== typesOf([...seed])) return false
  const texts = textsOf(current)
  return [...textsOf(seed)].every((text) => texts.has(text))
}

/**
 * A K4 page (K4hij): created when missing; a page that still has the layout of an older seed
 * (`legacy` — same blocks and all of its texts, see `isSeedLayout`) gets the
 * K4 layout; a page already on K4 sections only gains missing block types. Any other page was
 * edited in the panel: it is left alone and returned as `false` for the seed report.
 */
export async function upsertK4Page(
  payload: Payload,
  tenantId: number,
  page: SeedPage & { legacy: readonly PageBlock[][] },
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
  const isLegacy = found ? page.legacy.some((layout) => isSeedLayout(found.layout, layout)) : false
  const onK4 = found?.layout?.some((block) => block.blockType === 'bzSection') ?? false
  if (found && !isLegacy && !onK4) {
    report(`pages ${page.slug}`, false)
    return false
  }
  if (found && isLegacy) {
    await payload.update({
      collection: 'pages',
      id: found.id,
      data: { layout: page.layout, _status: 'published' },
      ...local,
    })
    report(`pages ${page.slug}`, true)
    return true
  }
  await upsertBiznesPage(payload, tenantId, page, report)
  return true
}

/**
 * A Biznes page from blocks (B8c `/kontakt`, B9 subpages): created and published when missing;
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
