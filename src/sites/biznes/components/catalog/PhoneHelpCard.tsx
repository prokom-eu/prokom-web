import Link from 'next/link'

import { Icon } from '@/components/ui/Icon'
import { getSiteSettings } from '@/lib/site/data'
import { toTelHref } from '@/lib/site/link'

import { AskQuoteTile } from '../home/AskQuoteTile'

type Props = {
  tenantId: number
  /** Unique on the page: names the card by its heading. */
  id: string
  /** The heading of the form this card stands for on a phone (same H2 as on a computer). */
  heading: string
  /** What the visitor looks at (a category, an industry): written into `/zapytanie?fraza=`. */
  topic?: string | null
}

const BUTTON =
  'inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl px-5 font-extrabold'

/**
 * Help card below 768 px (D12, plan 0611 §5.3 „Karta pomocy”): the form under a catalog page is
 * long on a phone, so the phone gets one card with the same heading — call, or describe the need
 * (the inquiry page with the topic written in, or the inquiry drawer). A computer keeps the full
 * form; no second form on the phone.
 */
export async function PhoneHelpCard({ tenantId, id, heading, topic }: Props) {
  const headingId = `${id}-h`
  const settings = await getSiteSettings(tenantId)
  const phone = settings?.phone ?? null
  const tel = phone ? toTelHref(phone) : null
  const describe = 'Opisz, czego potrzebujesz'
  return (
    <section data-phone-help aria-labelledby={headingId} className="px-4 pt-2 pb-8 md:hidden">
      <div className="rounded-[24px] bg-card p-5 shadow-[inset_0_0_0_1px_var(--border)]">
        <h2
          id={headingId}
          className="font-display text-[22px] leading-[1.1] font-extrabold font-stretch-110%"
        >
          {heading}
        </h2>
        <p className="mt-2 text-[14.5px] leading-relaxed text-ink-2">
          Zadzwoń albo napisz. Dobierzemy sprzęt i program do Twojej firmy.
        </p>
        <div className="mt-4 flex flex-col gap-2.5">
          {phone && tel && (
            <a href={tel} className={`${BUTTON} bg-accent-text text-accent-ink`}>
              <Icon name="phone" className="size-[18px]" />
              {phone}
            </a>
          )}
          {topic ? (
            <Link
              href={`/zapytanie?fraza=${encodeURIComponent(topic)}`}
              className={`${BUTTON} bg-surface-2 text-accent-text shadow-[inset_0_0_0_1px_var(--border)]`}
            >
              <Icon name="chat" className="size-5" />
              {describe}
            </Link>
          ) : (
            <AskQuoteTile
              className={`${BUTTON} bg-surface-2 text-accent-text shadow-[inset_0_0_0_1px_var(--border)]`}
            >
              <Icon name="chat" className="size-5" />
              {describe}
            </AskQuoteTile>
          )}
        </div>
      </div>
    </section>
  )
}
