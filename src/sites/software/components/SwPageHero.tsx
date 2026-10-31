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
  /** „Wersja robocza…” notice above the H1 — legal drafts, never on production (spec. §6.11). */
  draft?: boolean
}

/**
 * The shared `hero` block in the Software look (ADR-014 rozstrz. SW0 7: text pages from shared
 * blocks): breadcrumbs, H1 with the `**…**` part in the accent gradient (board `Polityka`:
 * „Twoje dane. **Krótko i po ludzku.**”), lead and an optional button. No image on Software.
 */
export function SwPageHero({ block, isFirst, pageTitle, draft = false }: Props) {
  const Heading = isFirst ? 'h1' : 'h2'
  return (
    <section className="pt-6 pb-4 min-[641px]:pt-10">
      <Container wide>
        {isFirst ? <Breadcrumbs current={pageTitle} /> : null}
        {draft ? (
          <p
            role="note"
            className="mt-3 flex max-w-[792px] gap-3 rounded-[18px] border border-warn/40 bg-warn/10 px-4 py-3 text-sm text-ink"
          >
            <span
              aria-hidden="true"
              className="grid size-5 shrink-0 place-items-center rounded-full border-2 border-warn text-xs font-black text-warn"
            >
              !
            </span>
            <span>
              <strong>Wersja robocza do sprawdzenia przed publikacją.</strong> Treść wymaga
              weryfikacji prawnej i uzupełnienia pól w nawiasach.
            </span>
          </p>
        ) : null}
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
