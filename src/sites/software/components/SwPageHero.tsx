import { BlockLink } from '@/blocks/BlockLink'
import { Container } from '@/components/ui/Container'
import type { HeroBlock as HeroBlockData } from '@/payload-types'
import { splitBold } from '@/lib/site/emphasis'

import { Breadcrumbs } from './Breadcrumbs'

type Props = {
  block: HeroBlockData
  isFirst: boolean
  /** Page title for the breadcrumbs. */
  pageTitle: string
}

/**
 * The shared `hero` block in the Software look (ADR-014 rozstrz. SW0 7: text pages from shared
 * blocks): breadcrumbs, H1 with the `**…**` part in the accent gradient (board `Polityka`:
 * „Twoje dane. **Krótko i po ludzku.**”), lead and an optional button. No image on Software.
 */
export function SwPageHero({ block, isFirst, pageTitle }: Props) {
  const Heading = isFirst ? 'h1' : 'h2'
  return (
    <section className="pt-6 pb-4 min-[641px]:pt-10">
      <Container wide>
        {isFirst ? <Breadcrumbs current={pageTitle} /> : null}
        <Heading className="mt-5 max-w-[22ch] font-display text-[40px] font-extrabold leading-[1.02] tracking-tight min-[641px]:text-[clamp(44px,5vw,68px)] min-[641px]:max-w-none">
          {splitBold(block.heading).map((part, index) =>
            part.bold ? (
              <span key={index} className="text-grad-h1">
                {part.text}
              </span>
            ) : (
              <span key={index}>{part.text}</span>
            ),
          )}
        </Heading>
        {block.lead ? (
          <p className="mt-5 max-w-[62ch] text-lg text-ink-2 min-[641px]:text-xl">{block.lead}</p>
        ) : null}
        <BlockLink link={block.cta} />
      </Container>
    </section>
  )
}
