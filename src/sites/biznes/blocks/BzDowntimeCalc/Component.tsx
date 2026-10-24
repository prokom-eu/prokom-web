import { Container } from '@/components/ui/Container'
import type { BzDowntimeCalcBlock as BzDowntimeCalcBlockData } from '@/payload-types'

import { SectionHead } from '../../components/home/SectionHead'
import { hasLink } from '../../components/PageLink'
import { DowntimeCalculator } from './DowntimeCalculator'

/** „Ile kosztuje przestój” (spec. §6.4 pkt 3, plansza Dzial): head and the calculator island. */
export function BzDowntimeCalcBlock({ block }: { block: BzDowntimeCalcBlockData }) {
  const headingId = `przestoj-${block.id ?? 'sekcja'}-h`
  return (
    <section aria-labelledby={headingId} className="py-14 sm:py-20">
      <Container wide>
        <SectionHead id={headingId} eyebrow={block.eyebrow} heading={block.heading} />
        <div className="mt-9">
          <DowntimeCalculator
            kicker={block.kicker}
            title={block.title}
            text={block.text}
            revenueLabel={block.revenueLabel}
            hoursLabel={block.hoursLabel}
            outageLabel={block.outageLabel}
            resultKicker={block.resultKicker}
            cta={hasLink(block.cta) ? block.cta : null}
            note={block.note}
          />
        </div>
      </Container>
    </section>
  )
}
