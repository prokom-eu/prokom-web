import { Icon } from '@/components/ui/Icon'
import { getSiteSettings } from '@/lib/site/data'
import { toTelHref } from '@/lib/site/link'
import type { BzContactBlock as BzContactBlockData } from '@/payload-types'

import { ContactPanel } from '../../components/forms/ContactPanel'
import { AskQuoteTile } from '../../components/home/AskQuoteTile'

type Props = { block: BzContactBlockData; tenantId: number }

/** Chips of the home form (board `Web-start` `#s4-kontakt`, prompt 2 W2), sent as topics. */
const HOME_TOPICS = [
  'Kasa fiskalna',
  'System POS / GoPOS',
  'Terminal płatniczy',
  'Program dla firmy',
  'KSeF',
  'Opieka IT / komputery',
  'Sieć i kopie danych',
  'Nie wiem, doradźcie',
] as const

/**
 * `#kontakt` of the Biznes home page (spec. §4 pkt 13): texts from the panel, the rest shared.
 * Below 768 px (board App-Start) the closing card „Nie wiesz, co wybrać?” with the phone and the
 * inquiry drawer takes the form's place; the form stays on `/kontakt` and `/zapytanie`.
 */
export async function BzContactBlock({ block, tenantId }: Props) {
  const settings = await getSiteSettings(tenantId)
  const phone = settings?.phone ?? null
  const tel = phone ? toTelHref(phone) : null
  return (
    <>
      <div className="max-md:hidden">
        <ContactPanel
          tenantId={tenantId}
          id="kontakt"
          heading={block.heading}
          lead={block.lead}
          formHeading={block.formHeading}
          formNote={block.formNote}
          promises={(block.promises ?? []).map((promise) => promise.text)}
          successText={block.successText}
          topics={HOME_TOPICS}
          topicsLabel="W czym możemy pomóc?"
          accentSecondSentence
        />
      </div>
      <section aria-labelledby="nie-wiesz-h" className="px-4 pt-2 pb-8 md:hidden">
        <div className="rounded-[24px] bg-card p-5 shadow-[inset_0_0_0_1px_var(--border)]">
          <h2
            id="nie-wiesz-h"
            className="font-display text-[22px] leading-[1.1] font-extrabold font-stretch-110%"
          >
            Nie wiesz, co wybrać?
          </h2>
          <p className="mt-2 text-[14.5px] leading-relaxed text-ink-2">
            Zadzwoń albo napisz. Dobierzemy sprzęt i program do Twojej firmy.
          </p>
          <div className="mt-4 flex gap-2.5">
            {phone && tel && (
              <a
                href={tel}
                className="inline-flex min-h-12 flex-1 items-center justify-center gap-2 rounded-2xl bg-accent-text px-5 font-extrabold text-accent-ink"
              >
                <Icon name="phone" className="size-[18px]" />
                {phone}
              </a>
            )}
            <AskQuoteTile className="inline-flex size-12 shrink-0 items-center justify-center rounded-2xl bg-surface-2 text-accent-text shadow-[inset_0_0_0_1px_var(--border)]">
              <Icon name="chat" className="size-5" />
              <span className="sr-only">Wyślij zapytanie</span>
            </AskQuoteTile>
          </div>
        </div>
      </section>
    </>
  )
}
