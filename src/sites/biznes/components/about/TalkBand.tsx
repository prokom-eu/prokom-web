import Link from 'next/link'

import { Contours } from '@/components/shared/Contours'
import { PAGE_CONTAINER } from '@/components/shared/pageContainer'
import { cx } from '@/components/ui/cx'
import { Icon } from '@/components/ui/Icon'
import { toTelHref } from '@/lib/site/link'
import { BZ_H2 } from '@/sites/biznes/typography'

import { BTN, BTN_ON_DARK } from '../../blocks/BzSection/ui'

const FOCUS =
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-on-dark-text'

/**
 * „Opowiedz, jak pracuje Twoja firma.” (Web-o-firmie, slot `beforeVisit`): a navy band with the
 * line's phone from the panel and „Napisz do nas” to the Kontakt form. No phone — only the link.
 */
export function TalkBand({ phone }: { phone: string | null | undefined }) {
  const tel = phone ? toTelHref(phone) : null
  return (
    <section
      aria-labelledby="o-firmie-rozmowa"
      className={cx(PAGE_CONTAINER, 'py-12 max-md:py-6')}
      data-talk-band
    >
      <div className="relative isolate flex flex-col gap-6 overflow-hidden rounded-[28px] bg-line-dark px-6 py-10 text-line-dark-text max-md:rounded-[24px] max-md:py-7 sm:px-12 min-[900px]:flex-row min-[900px]:items-center min-[900px]:justify-between min-[900px]:py-14">
        <Contours />
        <div className="flex max-w-[40rem] flex-col gap-3">
          <p className="text-xs font-extrabold tracking-[0.12em] text-on-dark-text uppercase">
            Porozmawiajmy
          </p>
          <h2 id="o-firmie-rozmowa" className={cx(BZ_H2, 'text-line-dark-ink')}>
            Opowiedz, jak pracuje Twoja firma.
          </h2>
          <p>Przyjedziemy albo zadzwonimy. Wycenę dostajesz na piśmie, bez zobowiązań.</p>
        </div>
        <div className="flex flex-wrap gap-3 max-sm:grid max-sm:grid-cols-1">
          {tel && (
            <a
              href={tel}
              className={cx(BTN, 'bg-on-dark text-on-dark-ink hover:opacity-90', FOCUS)}
            >
              <Icon name="phone" className="size-4" strokeWidth={2.2} />
              {phone}
            </a>
          )}
          <Link href="/kontakt#formularz" className={cx(BTN_ON_DARK, FOCUS)}>
            Napisz do nas
          </Link>
        </div>
      </div>
    </section>
  )
}
