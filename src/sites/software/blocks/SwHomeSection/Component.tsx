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

type Props = { block: SwHomeSectionBlockData; tenantId: number }

/**
 * One fixed section of the Software start page, picked in the block (ADR-014 rozstrz. 7).
 * A section without a component renders nothing.
 */
export function SwHomeSectionBlock({ block, tenantId }: Props) {
  switch (block.section) {
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
