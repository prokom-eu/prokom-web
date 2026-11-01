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
import { BzContactBlock } from '@/sites/biznes/blocks/BzContact/Component'
import { BzLocationBlock } from '@/sites/biznes/blocks/BzLocation/Component'
import { BzFactsBlock } from '@/sites/biznes/blocks/BzFacts/Component'
import { BzFeaturedBlock } from '@/sites/biznes/blocks/BzFeatured/Component'
import { BzHeroBlock } from '@/sites/biznes/blocks/BzHero/Component'
import { BzSectionBlock } from '@/sites/biznes/blocks/BzSection/Component'
import { HERO_VARIANTS, parseSectionData, type SectionVariant } from '@/lib/biznes/pages/sections'
import { BzKsefBlock } from '@/sites/biznes/blocks/BzKsef/Component'
import { QuickStart } from '@/sites/biznes/components/home/QuickStart'
import { BzOfferBlock } from '@/sites/biznes/blocks/BzOffer/Component'
import { BzOrderFlowBlock } from '@/sites/biznes/blocks/BzOrderFlow/Component'
import { BzPlanBlock } from '@/sites/biznes/blocks/BzPlan/Component'
import { BzReferencesBlock } from '@/sites/biznes/blocks/BzReferences/Component'
import { BzStepsBlock } from '@/sites/biznes/blocks/BzSteps/Component'
import { BzTimelineBlock } from '@/sites/biznes/blocks/BzTimeline/Component'
import { getEnv } from '@/lib/env'
import { Breadcrumbs } from '@/sites/biznes/components/Breadcrumbs'
import { SwLinesBlock } from '@/sites/software/blocks/SwLines/Component'
import { SwPageHeroBlock } from '@/sites/software/blocks/SwPageHero/Component'
import { SwStepsBlock } from '@/sites/software/blocks/SwSteps/Component'
import { SwTeamBlock } from '@/sites/software/blocks/SwTeam/Component'
import { SwCallToAction } from '@/sites/software/components/SwCallToAction'
import { SwPageHero } from '@/sites/software/components/SwPageHero'
import { SwRichText } from '@/sites/software/components/SwRichText'
import { BrandsHome } from '@/sites/biznes/components/home/BrandsHome'
import { FaqBiznes } from '@/sites/biznes/components/home/FaqBiznes'
import { InstArchitectsBlock } from '@/sites/instalacje/blocks/InstArchitects/Component'
import { InstContactBlock } from '@/sites/instalacje/blocks/InstContact/Component'
import { InstHomeBlock } from '@/sites/instalacje/blocks/InstHome/Component'
import { InstPlannerBlock } from '@/sites/instalacje/blocks/InstPlanner/Component'
import { InstServiceDeskBlock } from '@/sites/instalacje/blocks/InstServiceDesk/Component'
import { InstOfferBlock } from '@/sites/instalacje/blocks/InstOffer/Component'
import { InstRealizationsBlock } from '@/sites/instalacje/blocks/InstRealizations/Component'
import { InstAboutBlock } from '@/sites/instalacje/blocks/InstAbout/Component'
import { InstGuideBlock } from '@/sites/instalacje/blocks/InstGuide/Component'
import { InstServiceBlock } from '@/sites/instalacje/blocks/InstService/Component'
import { BlockStyles as InstalacjeBlockStyles } from '@/sites/instalacje/style/LineStyles'
import { SwHeroBlock } from '@/sites/software/blocks/SwHero/Component'
import { SwContactBlock } from '@/sites/software/blocks/SwContact/Component'
import { SwAuditFormBlock } from '@/sites/software/blocks/SwAuditForm/Component'
import { SwContactPageBlock } from '@/sites/software/blocks/SwContactPage/Component'
import { SwHomeSectionBlock } from '@/sites/software/blocks/SwHomeSection/Component'
import { SwPricingBlock } from '@/sites/software/blocks/SwPricing/Component'
import { FaqSoftware } from '@/sites/software/components/home/FaqSoftware'

type Props = { page: PublicPage; tenant: SiteTenant }

/** The Software privacy policy is a draft until the owner approves it (spec. §6.11, §13 pkt 24). */
const PRIVACY_SLUG = 'polityka-prywatnosci'

// Blocks that carry the page's H1 when they come first (otherwise the title is the H1).
const HERO_BLOCKS = new Set([
  'hero',
  'bzHero',
  'swHero',
  'swContactPage',
  'swPricing',
  'swAuditForm',
  'swPageHero',
  'instService',
  'instHome',
  'instPlanner',
  'instContact',
  'instServiceDesk',
  'instArchitects',
  'instOffer',
  'instRealizations',
  'instAbout',
  'instGuide',
])

/** First block carries the H1: a hero block, or a K4 section of a hero kind (K4hij). */
function opensWithHero(block: NonNullable<PublicPage['layout']>[number] | undefined): boolean {
  if (!block) return false
  if (block.blockType === 'bzSection') {
    // A hero whose data no longer fits renders nothing: the page title stays the H1 then.
    const variant = block.variant as SectionVariant
    return HERO_VARIANTS.has(variant) && parseSectionData(variant, block.data) !== null
  }
  return HERO_BLOCKS.has(block.blockType)
}

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
      {/* Linked only where an Instalacje block renders, not on the other lines. */}
      {blocks.some((block) => block.blockType.startsWith('inst')) && <InstalacjeBlockStyles />}
      {!opensWithHero(blocks[0]) && (
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
            if (software) {
              return (
                <SwPageHero
                  key={key}
                  block={block}
                  isFirst={i === 0}
                  pageTitle={page.title}
                  draft={page.slug === PRIVACY_SLUG && getEnv().SITE_ENV !== 'production'}
                />
              )
            }
            return <HeroBlock key={key} block={block} isFirst={i === 0} tenantId={tenant.id} />
          case 'richText':
            if (software) return <SwRichText key={key} block={block} />
            return <RichTextBlock key={key} block={block} />
          case 'serviceGrid':
            return <ServiceGridBlock key={key} block={block} />
          case 'callToAction':
            if (software) {
              return <SwCallToAction key={key} block={block} final={i === blocks.length - 1} />
            }
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
            return (
              <InquiryFormBlock
                key={key}
                block={block}
                phoneFirst={biznes}
                phoneRequired={tenant.line === 'instalacje'}
              />
            )
          case 'bzHero':
            return <BzHeroBlock key={key} block={block} isFirst={i === 0} tenantId={tenant.id} />
          case 'bzNeeds':
            // v150 (K36 §11): the need tiles became „Szybki start” — the block keeps its place.
            return (
              <QuickStart
                key={key}
                tenantId={tenant.id}
                planOnPage={blocks.some((other) => other.blockType === 'bzPlan')}
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
          case 'bzLocation':
            return <BzLocationBlock key={key} block={block} tenantId={tenant.id} />
          case 'bzOrderFlow':
            return <BzOrderFlowBlock key={key} block={block} tenantId={tenant.id} />
          case 'bzTimeline':
            return <BzTimelineBlock key={key} block={block} />
          case 'bzKsef':
            return <BzKsefBlock key={key} block={block} />
          case 'bzSection':
            return (
              <BzSectionBlock
                key={key}
                block={block}
                tenantId={tenant.id}
                crumbs={[
                  { name: 'Strona główna', href: '/' },
                  { name: page.title, href: pagePath(page.slug) },
                ]}
              />
            )
          case 'swHero':
            return <SwHeroBlock key={key} block={block} isFirst={i === 0} tenantId={tenant.id} />
          case 'swHomeSection':
            return <SwHomeSectionBlock key={key} block={block} tenantId={tenant.id} />
          case 'swContact':
            return <SwContactBlock key={key} block={block} tenantId={tenant.id} />
          case 'swAuditForm':
            return (
              <SwAuditFormBlock key={key} block={block} tenantId={tenant.id} isFirst={i === 0} />
            )
          case 'swPricing':
            return <SwPricingBlock key={key} block={block} tenantId={tenant.id} isFirst={i === 0} />
          case 'swContactPage':
            return (
              <SwContactPageBlock key={key} block={block} tenantId={tenant.id} isFirst={i === 0} />
            )
          case 'swPageHero':
            return (
              <SwPageHeroBlock
                key={key}
                block={block}
                tenantId={tenant.id}
                isFirst={i === 0}
                pageTitle={page.title}
              />
            )
          case 'swSteps':
            return <SwStepsBlock key={key} block={block} tenantId={tenant.id} />
          case 'swTeam':
            return <SwTeamBlock key={key} block={block} tenantId={tenant.id} />
          case 'swLines':
            return <SwLinesBlock key={key} block={block} tenantId={tenant.id} />
          case 'instService':
            return <InstServiceBlock key={key} block={block} tenantId={tenant.id} />
          case 'instHome':
            return <InstHomeBlock key={key} block={block} tenantId={tenant.id} />
          case 'instPlanner':
            return <InstPlannerBlock key={key} block={block} tenantId={tenant.id} />
          case 'instContact':
            return <InstContactBlock key={key} block={block} tenantId={tenant.id} />
          case 'instServiceDesk':
            return <InstServiceDeskBlock key={key} block={block} tenantId={tenant.id} />
          case 'instArchitects':
            return <InstArchitectsBlock key={key} block={block} tenantId={tenant.id} />
          case 'instOffer':
            return <InstOfferBlock key={key} block={block} tenantId={tenant.id} />
          case 'instRealizations':
            return <InstRealizationsBlock key={key} block={block} tenantId={tenant.id} />
          case 'instAbout':
            return <InstAboutBlock key={key} block={block} tenantId={tenant.id} />
          case 'instGuide':
            return <InstGuideBlock key={key} block={block} tenantId={tenant.id} />
        }
      })}
    </>
  )
}
