import Link from 'next/link'

import { Container } from '@/components/ui/Container'
import { Icon } from '@/components/ui/Icon'
import { getSiteSettings } from '@/lib/site/data'
import { toTelHref } from '@/lib/site/link'

type Props = {
  tenantId: number
  /** The heading of the category's help block (from the category data). */
  heading: string
  /** What the visitor looks at (the category): written into `/zapytanie?fraza=`. */
  topic: string
}

const BUTTON =
  'inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl px-5 font-extrabold'

/**
 * Help under a catalog category of Instalacje (INST-K2) in place of the Biznes form: the line
 * calls back and plans the installation, so a call and an inquiry about the category (the planner
 * is in the CTA band right below) — no „wycena na mailu” (ADR-I002 §4). `#kontakt` keeps the
 * grid's anchor.
 */
export async function CatalogHelp({ tenantId, heading, topic }: Props) {
  const settings = await getSiteSettings(tenantId)
  const phone = settings?.phone ?? null
  const tel = phone ? toTelHref(phone) : null
  return (
    <section id="kontakt" aria-labelledby="kontakt-h" className="scroll-mt-24 py-12 md:py-16">
      <Container wide>
        <div className="rounded-[24px] bg-card p-5 shadow-[inset_0_0_0_1px_var(--border)] md:flex md:items-center md:justify-between md:gap-10 md:p-8">
          <div className="max-w-[640px]">
            <h2
              id="kontakt-h"
              className="font-display text-[22px] leading-[1.1] font-extrabold font-stretch-110% md:text-[28px]"
            >
              {heading}
            </h2>
            <p className="mt-2 text-[15px] leading-relaxed text-ink-2">
              Zadzwoń albo opisz obiekt. Dobierzemy sprzęt, zamontujemy go i skonfigurujemy
              aplikację. Na montaż dajemy 24 miesiące gwarancji.
            </p>
          </div>
          <div className="mt-4 flex flex-col gap-2.5 md:mt-0 md:min-w-[280px]">
            {phone && tel && (
              <a href={tel} className={`${BUTTON} bg-accent-text text-accent-ink`}>
                <Icon name="phone" className="size-[18px]" />
                {phone}
              </a>
            )}
            <Link
              href={`/zapytanie?fraza=${encodeURIComponent(topic)}`}
              className={`${BUTTON} bg-surface-2 text-accent-text shadow-[inset_0_0_0_1px_var(--border)]`}
            >
              <Icon name="chat" className="size-5" />
              Zapytaj o ten sprzęt
            </Link>
          </div>
        </div>
      </Container>
    </section>
  )
}
