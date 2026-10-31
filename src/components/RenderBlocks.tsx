import { CallToActionBlock } from '@/blocks/CallToAction/Component'
import { ContactBlock } from '@/blocks/Contact/Component'
import { FaqBlock } from '@/blocks/Faq/Component'
import { HeroBlock } from '@/blocks/Hero/Component'
import { InquiryFormBlock } from '@/blocks/InquiryForm/Component'
import { PartnersBlock } from '@/blocks/Partners/Component'
import { renderableBlocks } from '@/blocks/registry'
import { RichTextBlock } from '@/blocks/RichText/Component'
import { ServiceGridBlock } from '@/blocks/ServiceGrid/Component'
import { Heading } from '@/components/ui/Heading'
import { Section } from '@/components/ui/Section'
import type { PublicPage } from '@/lib/pages/data'
import { HOME_SLUG, pagePath } from '@/lib/pages/slug'
import type { SiteTenant } from '@/lib/tenant/byHost'
import { BzAuditBlock } from '@/sites/biznes/blocks/BzAudit/Component'
import { BzCardsBlock } from '@/sites/biznes/blocks/BzCards/Component'
import { BzContactBlock } from '@/sites/biznes/blocks/BzContact/Component'
import { BzContactInfoBlock } from '@/sites/biznes/blocks/BzContactInfo/Component'
import { BzDowntimeCalcBlock } from '@/sites/biznes/blocks/BzDowntimeCalc/Component'
import { BzMonitoringBlock } from '@/sites/biznes/blocks/BzMonitoring/Component'
import { BzPageHeroBlock } from '@/sites/biznes/blocks/BzPageHero/Component'
import { BzLinesBlock } from '@/sites/biznes/blocks/BzLines/Component'
import { BzBrandsBlock } from '@/sites/biznes/blocks/BzBrands/Component'
import { BzLocationBlock } from '@/sites/biznes/blocks/BzLocation/Component'
import { BzQuickCardsBlock } from '@/sites/biznes/blocks/BzQuickCards/Component'
import { BzFactsBlock } from '@/sites/biznes/blocks/BzFacts/Component'
import { BzFeaturedBlock } from '@/sites/biznes/blocks/BzFeatured/Component'
import { BzHeroBlock } from '@/sites/biznes/blocks/BzHero/Component'
import { BzKitsBlock } from '@/sites/biznes/blocks/BzKits/Component'
import { BzKsefBlock } from '@/sites/biznes/blocks/BzKsef/Component'
import { BzModulesBlock } from '@/sites/biznes/blocks/BzModules/Component'
import { QuickStart } from '@/sites/biznes/components/home/QuickStart'
import { BzOfferBlock } from '@/sites/biznes/blocks/BzOffer/Component'
import { BzOrderFlowBlock } from '@/sites/biznes/blocks/BzOrderFlow/Component'
import { BzPanelsBlock } from '@/sites/biznes/blocks/BzPanels/Component'
import { BzPlanBlock } from '@/sites/biznes/blocks/BzPlan/Component'
import { BzProgramPickerBlock } from '@/sites/biznes/blocks/BzProgramPicker/Component'
import { BzReferencesBlock } from '@/sites/biznes/blocks/BzReferences/Component'
import { BzStepsBlock } from '@/sites/biznes/blocks/BzSteps/Component'
import { BzTimelineBlock } from '@/sites/biznes/blocks/BzTimeline/Component'
import { Breadcrumbs } from '@/sites/biznes/components/Breadcrumbs'
import { BrandsHome } from '@/sites/biznes/components/home/BrandsHome'
import { FaqBiznes } from '@/sites/biznes/components/home/FaqBiznes'
import { InstHomeBlock } from '@/sites/instalacje/blocks/InstHome/Component'
import { InstServiceBlock } from '@/sites/instalacje/blocks/InstService/Component'
import { SwHeroBlock } from '@/sites/software/blocks/SwHero/Component'
import { SwContactBlock } from '@/sites/software/blocks/SwContact/Component'
import { SwHomeSectionBlock } from '@/sites/software/blocks/SwHomeSection/Component'
import { FaqSoftware } from '@/sites/software/components/home/FaqSoftware'

type Props = { page: PublicPage; tenant: SiteTenant }

// Blocks that carry the page's H1 when they come first (otherwise the title is the H1).
const HERO_BLOCKS = new Set([
  'hero',
  'bzHero',
  'bzContactInfo',
  'bzPageHero',
  'swHero',
  'instService',
  'instHome',
])

/**
 * Page body from blocks. A block not allowed for the tenant's line is skipped (ADR-010), so
 * removing a block from a line's list hides it at once, before editors clean up the pages.
 * Without a hero as the first block, the page title is the h1. Shared blocks may look different
 * per line (ADR-014 rozstrz. 7): on Biznes, Partners is the brands bar and FAQ the cards with
 * a contact column; on Software, FAQ takes the line's look (SW8b).
 */
export function RenderBlocks({ page, tenant }: Props) {
  const blocks = renderableBlocks(tenant.line, page.layout)
  const biznes = tenant.line === 'biznes'
  const software = tenant.line === 'software'
  return (
    <>
      {!HERO_BLOCKS.has(blocks[0]?.blockType ?? '') && (
        <Section className="pb-0 sm:pb-0">
          {/* Biznes subpages open with breadcrumbs, like every other Biznes page (B11b). */}
          {biznes && page.slug !== HOME_SLUG && (
            <div className="mb-6">
              <Breadcrumbs
                items={[
                  { name: 'Strona główna', href: '/' },
                  { name: page.title, href: pagePath(page.slug) },
                ]}
              />
            </div>
          )}
          <Heading level={1} size="xl">
            {page.title}
          </Heading>
        </Section>
      )}
      {blocks.map((block, i) => {
        const key = block.id ?? `${block.blockType}-${i}`
        switch (block.blockType) {
          case 'hero':
            return <HeroBlock key={key} block={block} isFirst={i === 0} tenantId={tenant.id} />
          case 'richText':
            return <RichTextBlock key={key} block={block} />
          case 'serviceGrid':
            return <ServiceGridBlock key={key} block={block} />
          case 'callToAction':
            return <CallToActionBlock key={key} block={block} />
          case 'faq':
            if (biznes) return <FaqBiznes key={key} block={block} tenantId={tenant.id} />
            if (software) return <FaqSoftware key={key} block={block} tenantId={tenant.id} />
            return <FaqBlock key={key} block={block} />
          case 'contact':
            return <ContactBlock key={key} block={block} tenantId={tenant.id} />
          case 'partners':
            return biznes ? (
              <BrandsHome key={key} block={block} tenantId={tenant.id} />
            ) : (
              <PartnersBlock key={key} block={block} tenantId={tenant.id} />
            )
          case 'inquiryForm':
            return <InquiryFormBlock key={key} block={block} phoneFirst={biznes} />
          case 'bzHero':
            return <BzHeroBlock key={key} block={block} isFirst={i === 0} tenantId={tenant.id} />
          case 'bzNeeds':
            // v150 (K36 §11): the need tiles became „Szybki start” — the block keeps its place.
            return (
              <QuickStart
                key={key}
                tenantId={tenant.id}
                // The scenes of the plan section on this page (`bzPlan`) until K31d′.
                planScenes={
                  blocks.find((other) => other.blockType === 'bzPlan')?.scenes?.length ?? 0
                }
              />
            )
          case 'bzOffer':
            return <BzOfferBlock key={key} block={block} tenantId={tenant.id} />
          case 'bzFeatured':
            return <BzFeaturedBlock key={key} block={block} tenantId={tenant.id} />
          case 'bzPlan':
            return <BzPlanBlock key={key} block={block} tenantId={tenant.id} />
          case 'bzSteps':
            return <BzStepsBlock key={key} block={block} tenantId={tenant.id} />
          case 'bzReferences':
            return <BzReferencesBlock key={key} block={block} tenantId={tenant.id} />
          case 'bzFacts':
            return <BzFactsBlock key={key} block={block} tenantId={tenant.id} />
          case 'bzContact':
            return <BzContactBlock key={key} block={block} tenantId={tenant.id} />
          case 'bzContactInfo':
            return (
              <BzContactInfoBlock key={key} block={block} isFirst={i === 0} tenantId={tenant.id} />
            )
          case 'bzQuickCards':
            return <BzQuickCardsBlock key={key} block={block} />
          case 'bzLines':
            return <BzLinesBlock key={key} block={block} />
          case 'bzBrands':
            return <BzBrandsBlock key={key} block={block} tenantId={tenant.id} />
          case 'bzLocation':
            return <BzLocationBlock key={key} block={block} tenantId={tenant.id} />
          case 'bzPageHero':
            return (
              <BzPageHeroBlock
                key={key}
                block={block}
                isFirst={i === 0}
                page={page}
                tenantId={tenant.id}
              />
            )
          case 'bzCards':
            return <BzCardsBlock key={key} block={block} />
          case 'bzMonitoring':
            return <BzMonitoringBlock key={key} block={block} />
          case 'bzDowntimeCalc':
            return <BzDowntimeCalcBlock key={key} block={block} />
          case 'bzAudit':
            return <BzAuditBlock key={key} block={block} tenantId={tenant.id} />
          case 'bzModules':
            return <BzModulesBlock key={key} block={block} tenantId={tenant.id} />
          case 'bzOrderFlow':
            return <BzOrderFlowBlock key={key} block={block} tenantId={tenant.id} />
          case 'bzKits':
            return <BzKitsBlock key={key} block={block} tenantId={tenant.id} />
          case 'bzTimeline':
            return <BzTimelineBlock key={key} block={block} />
          case 'bzPanels':
            return <BzPanelsBlock key={key} block={block} />
          case 'bzProgramPicker':
            return <BzProgramPickerBlock key={key} block={block} tenantId={tenant.id} />
          case 'bzKsef':
            return <BzKsefBlock key={key} block={block} />
          case 'swHero':
            return <SwHeroBlock key={key} block={block} isFirst={i === 0} tenantId={tenant.id} />
          case 'swHomeSection':
            return <SwHomeSectionBlock key={key} block={block} tenantId={tenant.id} />
          case 'swContact':
            return <SwContactBlock key={key} block={block} tenantId={tenant.id} />
          case 'instService':
            return <InstServiceBlock key={key} block={block} tenantId={tenant.id} />
          case 'instHome':
            return <InstHomeBlock key={key} block={block} tenantId={tenant.id} />
        }
      })}
    </>
  )
}
