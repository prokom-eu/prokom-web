import { Container } from '@/components/ui/Container'
import type { CallToActionBlock as CallToActionBlockData } from '@/payload-types'

import { Buttons } from './about/Buttons'

/** The wizard as the second button — the same pair as the footer's CTA band (SWR2). */
const WIZARD = { label: 'Dobierz rozwiązanie · 60 s', href: '/dobierz' }

/**
 * The shared `callToAction` block in the Software look (boards `ONas`, `Wszystko`: „Poznajmy
 * się…”): a light accent card, the block's button and the wizard. It is the page's last CTA,
 * so the footer drops its band (`data-final-cta`, spec. §3.4 / ZMIANY-v21 §10.4).
 */
export function SwCallToAction({ block }: { block: CallToActionBlockData }) {
  return (
    <section data-final-cta className="py-12 min-[641px]:py-20">
      <Container wide>
        <div className="flex flex-col gap-6 rounded-[28px] border border-accent-line bg-accent-soft p-[22px] min-[641px]:p-12 min-[1081px]:flex-row min-[1081px]:items-center min-[1081px]:justify-between">
          <div className="max-w-[620px]">
            <h2 className="font-display text-[30px] font-extrabold leading-[1.05] tracking-tight min-[641px]:text-[40px]">
              {block.heading}
            </h2>
            {block.text ? (
              <p className="mt-3 text-lg text-ink-2 min-[641px]:text-xl">{block.text}</p>
            ) : null}
          </div>
          <Buttons primary={block.link} secondary={WIZARD} className="shrink-0" />
        </div>
      </Container>
    </section>
  )
}
