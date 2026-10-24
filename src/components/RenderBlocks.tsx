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
import type { SiteTenant } from '@/lib/tenant/byHost'
import { BzContactBlock } from '@/sites/biznes/blocks/BzContact/Component'
import { BzFactsBlock } from '@/sites/biznes/blocks/BzFacts/Component'
import { BzFeaturedBlock } from '@/sites/biznes/blocks/BzFeatured/Component'
import { BzHeroBlock } from '@/sites/biznes/blocks/BzHero/Component'
import { BzNeedsBlock } from '@/sites/biznes/blocks/BzNeeds/Component'
import { BzNewsBlock } from '@/sites/biznes/blocks/BzNews/Component'
import { BzOfferBlock } from '@/sites/biznes/blocks/BzOffer/Component'
import { BzOnePartnerBlock } from '@/sites/biznes/blocks/BzOnePartner/Component'
import { BzPlanBlock } from '@/sites/biznes/blocks/BzPlan/Component'
import { BzReferencesBlock } from '@/sites/biznes/blocks/BzReferences/Component'
import { BzStepsBlock } from '@/sites/biznes/blocks/BzSteps/Component'
import { BrandMarquee } from '@/sites/biznes/components/home/BrandMarquee'
import { FaqBiznes } from '@/sites/biznes/components/home/FaqBiznes'

type Props = { page: PublicPage; tenant: SiteTenant }

/** Blocks that carry the page's h1 when they come first. */
const HERO_BLOCKS = new Set(['hero', 'bzHero'])

/**
 * Page body from blocks. A block not allowed for the tenant's line is skipped (ADR-010), so
 * removing a block from a line's list hides it at once, before editors clean up the pages.
 * Without a hero as the first block, the page title is the h1. Shared blocks may look different
 * per line (ADR-014 rozstrz. 7): on Biznes, Partners is the brands bar and FAQ the cards with
 * a contact column.
 */
export function RenderBlocks({ page, tenant }: Props) {
  const blocks = renderableBlocks(tenant.line, page.layout)
  const biznes = tenant.line === 'biznes'
  return (
    <>
      {!HERO_BLOCKS.has(blocks[0]?.blockType ?? '') && (
        <Section className="pb-0 sm:pb-0">
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
            return biznes ? (
              <FaqBiznes key={key} block={block} tenantId={tenant.id} />
            ) : (
              <FaqBlock key={key} block={block} />
            )
          case 'contact':
            return <ContactBlock key={key} block={block} tenantId={tenant.id} />
          case 'partners':
            return biznes ? (
              <BrandMarquee key={key} block={block} tenantId={tenant.id} />
            ) : (
              <PartnersBlock key={key} block={block} tenantId={tenant.id} />
            )
          case 'inquiryForm':
            return <InquiryFormBlock key={key} block={block} phoneRequired={biznes} />
          case 'bzHero':
            return <BzHeroBlock key={key} block={block} isFirst={i === 0} tenantId={tenant.id} />
          case 'bzNeeds':
            return <BzNeedsBlock key={key} block={block} />
          case 'bzOffer':
            return <BzOfferBlock key={key} block={block} tenantId={tenant.id} />
          case 'bzFeatured':
            return <BzFeaturedBlock key={key} block={block} tenantId={tenant.id} />
          case 'bzPlan':
            return <BzPlanBlock key={key} block={block} tenantId={tenant.id} />
          case 'bzSteps':
            return <BzStepsBlock key={key} block={block} />
          case 'bzOnePartner':
            return <BzOnePartnerBlock key={key} block={block} tenantId={tenant.id} />
          case 'bzReferences':
            return <BzReferencesBlock key={key} block={block} tenantId={tenant.id} />
          case 'bzFacts':
            return <BzFactsBlock key={key} block={block} tenantId={tenant.id} />
          case 'bzNews':
            return <BzNewsBlock key={key} block={block} tenantId={tenant.id} />
          case 'bzContact':
            return <BzContactBlock key={key} block={block} tenantId={tenant.id} />
        }
      })}
    </>
  )
}
