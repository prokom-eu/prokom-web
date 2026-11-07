import { BUILT_HOME_SECTIONS, type HomeSectionValue } from '@/lib/software/homeSections'
import type { SwHomeSectionBlock as SwHomeSectionBlockData } from '@/payload-types'
import {
  AreasSection,
  CompareSection,
  GuaranteesSection,
  HowWeBuildSection,
  LivePreviewsSection,
  PopularSection,
  ProcessSection,
  TechnologiesSection,
  WhyNotWordpressSection,
  WizardSection,
} from '@/sites/software/components/home/HomeSections'
import {
  BentoBlockSection,
  PromisesSection,
  ShowroomBlockSection,
  SituationsSection,
} from '@/sites/software/components/v24home/HomeV24Blocks'

type Props = { block: SwHomeSectionBlockData; tenantId: number }

/**
 * One fixed section of the Software start page, picked in the block (ADR-014 rozstrz. 7).
 * A section without a component renders nothing.
 */
export function SwHomeSectionBlock({ block, tenantId }: Props) {
  // v24: a block of a section no longer built (the v23 ones) stays in the panel but renders nothing;
  // the v23 cases below and their components go with `feat/swa2-sprzatanie` (decision D6, STAN).
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
    case 'areas':
      return <AreasSection tenantId={tenantId} />
    case 'popular':
      return <PopularSection tenantId={tenantId} />
    case 'livePreviews':
      return <LivePreviewsSection tenantId={tenantId} />
    case 'process':
      return <ProcessSection tenantId={tenantId} />
    case 'wizard':
      return <WizardSection tenantId={tenantId} />
    case 'whyNotWordpress':
      return <WhyNotWordpressSection tenantId={tenantId} />
    case 'guarantees':
      return <GuaranteesSection tenantId={tenantId} />
    case 'howWeBuild':
      return <HowWeBuildSection tenantId={tenantId} />
    case 'technologies':
      return <TechnologiesSection tenantId={tenantId} />
    case 'compare':
      return <CompareSection tenantId={tenantId} />
    default:
      return null
  }
}
