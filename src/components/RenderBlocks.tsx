import { CallToActionBlock } from '@/blocks/CallToAction/Component'
import { ContactBlock } from '@/blocks/Contact/Component'
import { FaqBlock } from '@/blocks/Faq/Component'
import { HeroBlock } from '@/blocks/Hero/Component'
import { renderableBlocks } from '@/blocks/registry'
import { RichTextBlock } from '@/blocks/RichText/Component'
import { ServiceGridBlock } from '@/blocks/ServiceGrid/Component'
import type { PublicPage } from '@/lib/pages/data'
import type { SiteTenant } from '@/lib/tenant/byHost'

type Props = { page: PublicPage; tenant: SiteTenant }

/**
 * Page body from blocks. A block not allowed for the tenant's line is skipped (ADR-010), so
 * removing a block from a line's list hides it at once, before editors clean up the pages.
 * Without a hero as the first block, the page title is the h1.
 */
export function RenderBlocks({ page, tenant }: Props) {
  const blocks = renderableBlocks(tenant.line, page.layout)
  return (
    <>
      {blocks[0]?.blockType !== 'hero' && <h1>{page.title}</h1>}
      {blocks.map((block, i) => {
        const key = block.id ?? `${block.blockType}-${i}`
        switch (block.blockType) {
          case 'hero':
            return <HeroBlock key={key} block={block} isFirst={i === 0} />
          case 'richText':
            return <RichTextBlock key={key} block={block} />
          case 'serviceGrid':
            return <ServiceGridBlock key={key} block={block} />
          case 'callToAction':
            return <CallToActionBlock key={key} block={block} />
          case 'faq':
            return <FaqBlock key={key} block={block} />
          case 'contact':
            return <ContactBlock key={key} block={block} tenantId={tenant.id} />
        }
      })}
    </>
  )
}
