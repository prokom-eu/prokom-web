import type { SwHomeSectionBlock as SwHomeSectionBlockData } from '@/payload-types'
import {
  AreasSection,
  GuaranteesSection,
  LivePreviewsSection,
  PopularSection,
  ProcessSection,
  ShowcaseSection,
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
    case 'showcase':
      return <ShowcaseSection tenantId={tenantId} />
    default:
      return null
  }
}
