import type { Block, BlocksField, PayloadRequest } from 'payload'

import { tenantIdOf } from '../lib/tenant/id'
import { isLine, type Line } from '../lib/tenant/lines'
import { BzContactBlock } from '../sites/biznes/blocks/BzContact/config'
import { BzContactInfoBlock } from '../sites/biznes/blocks/BzContactInfo/config'
import { BzFactsBlock } from '../sites/biznes/blocks/BzFacts/config'
import { BzFeaturedBlock } from '../sites/biznes/blocks/BzFeatured/config'
import { BzHeroBlock } from '../sites/biznes/blocks/BzHero/config'
import { BzNeedsBlock } from '../sites/biznes/blocks/BzNeeds/config'
import { BzNewsBlock } from '../sites/biznes/blocks/BzNews/config'
import { BzOfferBlock } from '../sites/biznes/blocks/BzOffer/config'
import { BzOnePartnerBlock } from '../sites/biznes/blocks/BzOnePartner/config'
import { BzPlanBlock } from '../sites/biznes/blocks/BzPlan/config'
import { BzQuickCardsBlock } from '../sites/biznes/blocks/BzQuickCards/config'
import { BzReferencesBlock } from '../sites/biznes/blocks/BzReferences/config'
import { BzStepsBlock } from '../sites/biznes/blocks/BzSteps/config'
import { BzKsefBlock } from '../sites/biznes/blocks/BzKsef/config'
import { BzProgramPickerBlock } from '../sites/biznes/blocks/BzProgramPicker/config'
import { BzKitsBlock } from '../sites/biznes/blocks/BzKits/config'
import { BzModulesBlock } from '../sites/biznes/blocks/BzModules/config'
import { BzOrderFlowBlock } from '../sites/biznes/blocks/BzOrderFlow/config'
import { BzPanelsBlock } from '../sites/biznes/blocks/BzPanels/config'
import { BzTimelineBlock } from '../sites/biznes/blocks/BzTimeline/config'
import { BzAuditBlock } from '../sites/biznes/blocks/BzAudit/config'
import { BzCardsBlock } from '../sites/biznes/blocks/BzCards/config'
import { BzDowntimeCalcBlock } from '../sites/biznes/blocks/BzDowntimeCalc/config'
import { BzMonitoringBlock } from '../sites/biznes/blocks/BzMonitoring/config'
import { BzPageHeroBlock } from '../sites/biznes/blocks/BzPageHero/config'
import { BzLinesBlock } from '../sites/biznes/blocks/BzLines/config'
import { BzBrandsBlock } from '../sites/biznes/blocks/BzBrands/config'
import { BzLocationBlock } from '../sites/biznes/blocks/BzLocation/config'
import { InstServiceBlock } from '../sites/instalacje/blocks/InstService/config'
import { SwHeroBlock } from '../sites/software/blocks/SwHero/config'
import { SwHomeSectionBlock } from '../sites/software/blocks/SwHomeSection/config'
import { SwContactBlock } from '../sites/software/blocks/SwContact/config'
import { CallToActionBlock } from './CallToAction/config'
import { ContactBlock } from './Contact/config'
import { FaqBlock } from './Faq/config'
import { HeroBlock } from './Hero/config'
import { InquiryFormBlock } from './InquiryForm/config'
import { PartnersBlock } from './Partners/config'
import { RichTextBlock } from './RichText/config'
import { ServiceGridBlock } from './ServiceGrid/config'

/** Blocks every line may use (S5); each line gives them its own look where needed. */
export const GENERIC_BLOCKS: Block[] = [
  HeroBlock,
  RichTextBlock,
  ServiceGridBlock,
  CallToActionBlock,
  FaqBlock,
  ContactBlock,
  PartnersBlock,
  InquiryFormBlock,
]

/** Sections of the Biznes pages (B7 home, B8c contact, B9 subpages, B11c about) — `src/sites/biznes/blocks/`. */
export const BIZNES_BLOCKS: Block[] = [
  BzHeroBlock,
  BzNeedsBlock,
  BzOfferBlock,
  BzFeaturedBlock,
  BzPlanBlock,
  BzStepsBlock,
  BzOnePartnerBlock,
  BzReferencesBlock,
  BzFactsBlock,
  BzNewsBlock,
  BzContactBlock,
  BzContactInfoBlock,
  BzQuickCardsBlock,
  BzPageHeroBlock,
  BzCardsBlock,
  BzMonitoringBlock,
  BzDowntimeCalcBlock,
  BzAuditBlock,
  BzModulesBlock,
  BzOrderFlowBlock,
  BzKitsBlock,
  BzTimelineBlock,
  BzPanelsBlock,
  BzProgramPickerBlock,
  BzKsefBlock,
  // B11c: /o-firmie
  BzLinesBlock,
  BzBrandsBlock,
  BzLocationBlock,
]

/**
 * Sections of the Instalacje pages (ADR-I002 §0) — `src/sites/instalacje/blocks/`; the blocks
 * come with their sessions (I4–I12).
 */
export const INSTALACJE_BLOCKS: Block[] = [InstServiceBlock]

/**
 * Sections of the Software pages (ADR-014 rozstrz. SW0 7, at most 10) — `src/sites/software/blocks/`.
 * The fixed start page sections are one block, `swHomeSection`, with the section picked; new
 * blocks go at the end (SW8b: `swContact`).
 */
export const SOFTWARE_BLOCKS: Block[] = [SwHeroBlock, SwHomeSectionBlock, SwContactBlock]

/**
 * Every block a page may contain (ADR-010). A block of one line only lives in
 * `src/sites/<line>/blocks/` and is listed here too. Each block means new tables → migration;
 * new blocks go at the end, so the existing tables keep their names.
 */
export const ALL_BLOCKS: Block[] = [
  ...GENERIC_BLOCKS,
  ...BIZNES_BLOCKS,
  ...INSTALACJE_BLOCKS,
  ...SOFTWARE_BLOCKS,
]

const slugsOf = (blocks: Block[]): readonly string[] => blocks.map((block) => block.slug)

export const GENERIC_BLOCK_SLUGS = slugsOf(GENERIC_BLOCKS)
export const BIZNES_BLOCK_SLUGS = slugsOf(BIZNES_BLOCKS)
export const INSTALACJE_BLOCK_SLUGS = slugsOf(INSTALACJE_BLOCKS)
export const SOFTWARE_BLOCK_SLUGS = slugsOf(SOFTWARE_BLOCKS)
export const BLOCK_SLUGS = slugsOf(ALL_BLOCKS)

export type AllowedBlocks = Readonly<Record<Line, readonly string[]>>

/** Blocks allowed per line: the generic ones everywhere, a line's own only on that line. */
export const ALLOWED_BLOCKS: AllowedBlocks = {
  prokom: GENERIC_BLOCK_SLUGS,
  biznes: [...GENERIC_BLOCK_SLUGS, ...BIZNES_BLOCK_SLUGS],
  instalacje: [...GENERIC_BLOCK_SLUGS, ...INSTALACJE_BLOCK_SLUGS],
  software: [...GENERIC_BLOCK_SLUGS, ...SOFTWARE_BLOCK_SLUGS],
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
