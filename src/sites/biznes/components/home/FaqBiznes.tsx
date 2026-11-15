import type { ReactNode } from 'react'

import { cx } from '@/components/ui/cx'
import { Container } from '@/components/ui/Container'
import { Icon } from '@/components/ui/Icon'
import { faqJsonLd, serializeJsonLd } from '@/lib/seo/jsonLd'
import { getCompanyData, getSiteSettings } from '@/lib/site/data'
import { toTelHref } from '@/lib/site/link'
import type { FaqBlock as FaqBlockData } from '@/payload-types'
import { BZ_H2, BZ_LEAD } from '@/sites/biznes/typography'

import { LiveHours } from './LiveHours'

type Props = {
  block: FaqBlockData
  tenantId: number
  /**
   * A card in the right column, after the questions in the page's order (Opieka IT: „Ile masz
   * stanowisk?”, `faqSeatsPair`, Web-opieka-it); with it the contact card is left out. On a phone
   * it comes under the questions.
   */
  aside?: ReactNode
}

/** The field is optional in the shared block: never an empty `h2` the section points to. */
const DEFAULT_HEADING = 'Najczęstsze pytania'

/**
 * Biznes look of the shared FAQ block (runda 1411, board `Koniec.dc.html`; ZMIANY-v20 §2.8
 * before): a sticky navy panel on the left — label, heading, lead, both numbers and the hours —
 * and the numbered accordion on the right, the first one open. `<details>` works without
 * JavaScript; `FAQPage` JSON-LD as in the shared block. Phone (§5): the panel above the questions.
 */
export async function FaqBiznes({ block, tenantId, aside }: Props) {
  const [settings, company] = await Promise.all([getSiteSettings(tenantId), getCompanyData()])
  const phones = [settings?.phone, settings?.phone2].flatMap((number) => {
    const href = number ? toTelHref(number) : null
    return number && href ? [{ number, href }] : []
  })
  const hours = company?.locations[0]?.hours ?? []

  return (
    <section id="faq" aria-labelledby="faq-h" className="bg-surface-2 py-16 max-md:py-7 sm:py-24">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(faqJsonLd(block.items)) }}
      />
      <Container
        wide
        className={cx(
          'grid gap-10 max-md:gap-4',
          aside
            ? 'gap-y-6 min-[1080px]:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]'
            : 'min-[1080px]:grid-cols-[minmax(0,0.8fr)_minmax(0,1fr)]',
        )}
      >
        {aside ? (
          <div className="min-[1080px]:col-start-1">
            {block.eyebrow && (
              <p className="mb-3 text-[13px] font-extrabold tracking-[0.08em] text-accent-text uppercase max-md:hidden">
                {block.eyebrow}
              </p>
            )}
            <h2 id="faq-h" className={cx(BZ_H2, 'max-md:text-[22px] max-md:leading-[1.1]')}>
              {block.heading || DEFAULT_HEADING}
            </h2>
            {block.lead && (
              <p className={`${BZ_LEAD} mt-4 max-w-[46ch] text-ink-2 max-md:hidden`}>
                {block.lead}
              </p>
            )}
          </div>
        ) : (
          <div
            data-surface="dark"
            className="relative isolate flex flex-col gap-4 overflow-hidden rounded-[28px] bg-surface-dark p-8 text-white max-md:p-6 min-[1080px]:sticky min-[1080px]:top-28 min-[1080px]:self-start"
            data-faq-panel
          >
            {block.eyebrow && (
              <p className="text-[12px] font-extrabold tracking-[0.16em] text-accent-on-dark uppercase">
                {block.eyebrow}
              </p>
            )}
            <h2
              id="faq-h"
              className={cx(BZ_H2, 'text-white max-md:text-[26px] max-md:leading-[1.1]')}
            >
              {block.heading || DEFAULT_HEADING}
            </h2>
            {block.lead && (
              <p className="max-w-[46ch] text-[15.5px] leading-relaxed text-white/80">
                {block.lead}
              </p>
            )}
            {phones.length > 0 && (
              <ul className="mt-2 grid gap-2.5">
                {phones.map((item, i) => (
                  <li key={item.href}>
                    <a
                      href={item.href}
                      className={cx(
                        'flex min-h-[52px] items-center gap-3 rounded-2xl px-4 font-display text-[19px] font-extrabold whitespace-nowrap focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white',
                        i === 0
                          ? 'bg-white text-surface-dark'
                          : 'text-white shadow-[inset_0_0_0_1.5px_color-mix(in_srgb,var(--c-white)_28%,transparent)]',
                      )}
                    >
                      <Icon name="phone" className="size-[18px]" />
                      {item.number}
                    </a>
                  </li>
                ))}
              </ul>
            )}
            <LiveHours hours={hours} className="text-sm text-white/80" />
          </div>
        )}
        <ol
          className={cx(
            'flex flex-col gap-2.5 max-md:gap-2',
            Boolean(aside) && 'min-[1080px]:col-start-1',
          )}
        >
          {block.items.map((item, i) => (
            <li key={item.id ?? i}>
              <details
                open={i === 0}
                className="group rounded-[18px] bg-card shadow-[inset_0_0_0_1px_var(--border)] transition-shadow open:shadow-[0_20px_40px_-28px_var(--glow),inset_0_0_0_1.5px_var(--accent-text)]"
              >
                <summary className="flex min-h-[68px] cursor-pointer list-none items-center gap-4 px-5 py-4 max-md:min-h-14 max-md:gap-3 max-md:px-4 max-md:py-3 [&::-webkit-details-marker]:hidden">
                  <span
                    aria-hidden="true"
                    className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-surface-2 font-display text-[13px] font-extrabold text-accent-text group-open:bg-accent-text group-open:text-accent-ink"
                  >
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <span className="flex-1 text-[16.5px] leading-snug font-extrabold text-ink max-md:text-[15px]">
                    {item.question}
                  </span>
                  <span
                    aria-hidden="true"
                    className="flex size-[34px] shrink-0 items-center justify-center rounded-full bg-surface-2 text-ink transition-[rotate,background-color,color] duration-200 group-open:rotate-45 group-open:bg-accent-text group-open:text-accent-ink motion-reduce:transition-none"
                  >
                    <svg viewBox="0 0 24 24" className="size-4" aria-hidden="true">
                      <path
                        d="M12 5v14M5 12h14"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.4"
                        strokeLinecap="round"
                      />
                    </svg>
                  </span>
                </summary>
                <p className="px-5 pb-5 pl-[3.6rem] leading-relaxed text-ink-2 max-md:px-4 max-md:pb-4 max-md:pl-[3.2rem] max-md:text-sm">
                  {item.answer}
                </p>
              </details>
            </li>
          ))}
        </ol>
        {aside && (
          <div className="min-[1080px]:col-start-2 min-[1080px]:row-span-2 min-[1080px]:row-start-1 min-[1080px]:sticky min-[1080px]:top-28 min-[1080px]:self-start">
            {aside}
          </div>
        )}
      </Container>
    </section>
  )
}
