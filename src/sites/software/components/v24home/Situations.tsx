'use client'

import { IntentLink as Link } from '@/components/shared/IntentLink'
import { useId, useState } from 'react'

import type { SoftwareHome } from '@/lib/software/home'
import { Mockup } from '@/sites/software/components/mockups/MockupLazy'
import { PriceTag } from '@/sites/software/components/ui/PriceTag'
import { SectionHead } from '@/sites/software/components/ui/SectionHead'

import { usePausedOffscreen } from './usePausedOffscreen'
import { offerHref, type PriceLine } from '@/lib/software/priceCards'

type Props = {
  situations: NonNullable<SoftwareHome['situations']>
  prices: Record<string, PriceLine>
}

/**
 * „Z czym do nas przychodzisz?” (ZMIANY-v24 §4 pkt 3, board `AU-pc` „sytuacje”): four situations,
 * one open at a time with its mock-up, the „od” price of its solution and the link to the offer.
 * A situation opens on hover (mouse) or on a click / Enter; the first is open at the start.
 */
export function Situations({ situations, prices }: Props) {
  const ids = useId()
  const section = usePausedOffscreen<HTMLElement>()
  const [open, setOpen] = useState(0)
  return (
    <section ref={section} id="sytuacje" className="v-sec">
      <div className="v-wrap">
        <SectionHead
          eyebrow={situations.eyebrow}
          title={situations.title}
          em={situations.em}
          lead={situations.lead}
          align="center"
          className="v-head-center"
        />
        <ul className="v-sits" data-rise-group>
          {situations.items.map((item, index) => {
            const on = index === open
            const price = prices[item.solution]
            return (
              <li
                key={item.short}
                className="sw-glass v-sit"
                data-open={on || undefined}
                onPointerEnter={(event) => {
                  if (event.pointerType === 'mouse') setOpen(index)
                }}
              >
                <button
                  type="button"
                  className="v-sit-tx"
                  aria-expanded={on}
                  aria-controls={`${ids}-sit-${index}`}
                  onClick={() => setOpen(index)}
                >
                  <span className="v-sit-n">
                    {String(index + 1).padStart(2, '0')} · {item.short}
                  </span>
                  <span className="v-sit-q">{item.question}</span>
                </button>
                <div id={`${ids}-sit-${index}`} className="v-sit-body" hidden={!on}>
                  <p>{item.answer}</p>
                  <div className="v-row">
                    {price && <PriceTag line={price} withTerm />}
                    <Link className="v-link" href={offerHref(item.solution)}>
                      {item.offer ?? situations.offer} <span aria-hidden="true">→</span>
                    </Link>
                  </div>
                </div>
                <div className="v-scr v-sit-scr" aria-hidden="true">
                  {on && (
                    <Mockup
                      kind={item.mockup.kind}
                      variant={item.mockup.variant}
                      phone={item.phone}
                      toast={item.phone}
                      fit="contain"
                    />
                  )}
                </div>
              </li>
            )
          })}
        </ul>
      </div>
    </section>
  )
}
