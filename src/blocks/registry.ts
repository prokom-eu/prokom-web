import type { Block, BlocksField, PayloadRequest } from 'payload'

import { tenantIdOf } from '../lib/tenant/id'
import { isLine, type Line } from '../lib/tenant/lines'
import { CallToActionBlock } from './CallToAction/config'
import { ContactBlock } from './Contact/config'
import { FaqBlock } from './Faq/config'
import { HeroBlock } from './Hero/config'
import { PartnersBlock } from './Partners/config'
import { RichTextBlock } from './RichText/config'
import { ServiceGridBlock } from './ServiceGrid/config'

/**
 * Every block a page may contain (ADR-010). A block of one line only lives in
 * `src/sites/<line>/blocks/` and is listed here too. Each block means new tables → migration.
 */
export const ALL_BLOCKS: Block[] = [
  HeroBlock,
  RichTextBlock,
  ServiceGridBlock,
  CallToActionBlock,
  FaqBlock,
  ContactBlock,
  PartnersBlock,
]

export const BLOCK_SLUGS: readonly string[] = ALL_BLOCKS.map((block) => block.slug)

export type AllowedBlocks = Readonly<Record<Line, readonly string[]>>

/** Blocks allowed per line. At the start (S5) every line has all generic blocks. */
export const ALLOWED_BLOCKS: AllowedBlocks = {
  prokom: BLOCK_SLUGS,
  biznes: BLOCK_SLUGS,
  instalacje: BLOCK_SLUGS,
  software: BLOCK_SLUGS,
}

export function allowedBlockSlugs(
  line: Line | null | undefined,
  map: AllowedBlocks = ALLOWED_BLOCKS,
): string[] {
  return line ? [...map[line]] : []
}

export function isBlockAllowed(
  line: Line | null | undefined,
  slug: string,
  map: AllowedBlocks = ALLOWED_BLOCKS,
): boolean {
  return allowedBlockSlugs(line, map).includes(slug)
}

/** Blocks the renderer shows: a block not allowed (or unknown) for the line is skipped. */
export function renderableBlocks<T extends { blockType: string }>(
  line: Line | null | undefined,
  layout: readonly T[] | null | undefined,
  map: AllowedBlocks = ALLOWED_BLOCKS,
): T[] {
  return (layout ?? []).filter((block) => isBlockAllowed(line, block.blockType, map))
}

type ResolveLine = (tenantId: number, req?: PayloadRequest) => Promise<Line | null>

/**
 * `filterOptions` of the page blocks field: only the blocks of the tenant's line. Payload
 * evaluates it in the panel and again in validation on save (REST and Local API alike), so a
 * block outside the list is rejected on the server. No tenant → no blocks.
 */
export function createBlocksFilter(map: AllowedBlocks, resolveLine: ResolveLine) {
  return async ({ data, req }: { data: Record<string, unknown>; req?: PayloadRequest }) => {
    const tenantId = tenantIdOf(data?.tenant)
    if (tenantId === null) return []
    return allowedBlockSlugs(await resolveLine(tenantId, req), map)
  }
}

const lineOfTenant: ResolveLine = async (tenantId, req) => {
  if (!req) return null
  const tenant = await req.payload
    .findByID({ collection: 'tenants', id: tenantId, depth: 0, overrideAccess: true, req })
    .catch(() => null)
  return isLine(tenant?.line) ? tenant.line : null
}

export const blocksFilterOptions: BlocksField['filterOptions'] = createBlocksFilter(
  ALLOWED_BLOCKS,
  lineOfTenant,
)
