import { BUILT_HOME_SECTIONS, type HomeSectionValue } from '@/lib/software/homeSections'
import type { SwHomeSectionBlock as SwHomeSectionBlockData } from '@/payload-types'
import { CompareSection, WizardSection } from '@/sites/software/components/home/HomeSections'
import {
  BentoBlockSection,
  PricingBlockSection,
  ProcessBlockSection,
  PromisesSection,
  ShowroomBlockSection,
  SituationsSection,
  TechBlockSection,
} from '@/sites/software/components/v24home/HomeV24Blocks'

type Props = { block: SwHomeSectionBlockData; tenantId: number }

/**
 * One fixed section of the Software start page, picked in the block (ADR-014 rozstrz. 7).
 * A section without a component renders nothing.
 */
export function SwHomeSectionBlock({ block, tenantId }: Props) {
  if (!BUILT_HOME_SECTIONS.includes(block.section as HomeSectionValue)) return null
  switch (block.section) {
    case 'promises':
      return <PromisesSection tenantId={tenantId} />
    case 'situations':
      return <SituationsSection tenantId={tenantId} />
    case 'bento':
      return <BentoBlockSection tenantId={tenantId} />
    case 'showroom':
      return <ShowroomBlockSection tenantId={tenantId} />
    case 'tech':
      return <TechBlockSection tenantId={tenantId} />
    case 'pricing':
      return <PricingBlockSection tenantId={tenantId} />
    case 'process':
      return <ProcessBlockSection tenantId={tenantId} />
    case 'wizard':
      return <WizardSection tenantId={tenantId} />
    case 'compare':
      return <CompareSection tenantId={tenantId} />
    default:
      return null
  }
}
