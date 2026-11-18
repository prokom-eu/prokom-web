import type { CSSProperties } from 'react'

import { cx } from '@/components/ui/cx'
import { Icon } from '@/components/ui/Icon'
import type { SharedLine } from '@/lib/shared/project'
import { withGamingLast, type SharedLineKey } from '@/lib/shared/lines'
import type { OpeningHours } from '@/lib/shared/openingStatus'
import { toTelHref } from '@/lib/site/link'

import { BrandBarPill } from './BrandBarPill'
import { OpeningStatus } from './OpeningStatus'

export type BrandBarProps = {
  /** Published lines in panel order (`getSharedData().lines`). */
  lines: readonly SharedLine[]
  /** The line of this site — bold, with `aria-current`. */
  current: SharedLineKey
  hours: OpeningHours
  holidays: readonly string[]
  /** Server time (ISO) for the opening status. */
  now: string
  /** The line's link next to the status (`shared.brandBarSlot`: „Konfigurator”, „Zgłoś awarię”…). */
  slot?: { label?: string | null; href?: string | null } | null
  phone: string | null
  /** The line's second number, after the first (Biznes, runda 1411); none = as before. */
  phone2?: string | null
  /** „Biznes:” — `shared.phoneLabel`. */
  phoneLabel?: string | null
  className?: string
}

/**
 * Brand bar above the header capsule (spec §5 `BrandBar`, NAGLOWEK-KAPSULA §2–3): the line switch
 * on the left, opening status, the line's link and phone on the right. 38 px, no background — it
 * scrolls away with the page. Hidden up to 1080 px (the phone menu sheet carries the same).
 * „Premium” (MOTYW-PASEK-LINII §4, styles `.bbar-*` in `wspolne.css`): lines as pills with a living
 * dash, the line's description in a tooltip (CSS only: after 350 ms of pointing, at once on
 * keyboard focus, never on touch), a pill following the pointer (`BrandBarPill`, the only client
 * part) and the lines coming in one after another on load.
 */
export function BrandBar({
  lines,
  current,
  hours,
  holidays,
  now,
  slot,
  phone,
  phone2,
  phoneLabel,
  className,
}: BrandBarProps) {
  const tel = phone ? toTelHref(phone) : null
  const tel2 = phone2 ? toTelHref(phone2) : null
  return (
    <div
      className={cx(
        'mx-auto hidden h-[38px] w-full max-w-[1344px] items-center justify-between gap-6 px-8 text-[12.5px] text-nav-ink-2 min-[1081px]:flex',
        className,
      )}
      data-brand-bar
    >
      <nav aria-label="Linie PRO-KOM" className="bbar-lines" data-bbar-lines="">
        {/* Pill under the pointed or focused line (MOTYW-PASEK-LINII §4 pkt 1): the only island. */}
        <BrandBarPill />
        {withGamingLast(lines).map((line, index) => {
          const isCurrent = line.key === current
          // A published line without an address (not live yet) is a label, not a dead link.
          const Tag = line.url ? 'a' : 'span'
          const tip = line.description ? `bbar-tip-${line.key}` : undefined
          // The line's brand colour from the panel; Gaming's gold is darker on the bar (§2.4).
          const colour =
            line.key === 'gaming' ? 'var(--gaming-dash)' : (line.color ?? 'currentColor')
          return (
            <span
              key={line.key}
              className="bbar-item"
              style={{ '--lc': colour, '--i': index } as CSSProperties}
            >
              <Tag
                href={line.url ?? undefined}
                aria-current={isCurrent ? 'page' : undefined}
                aria-describedby={tip}
                className="bbar-line"
              >
                <i aria-hidden="true" className="bbar-dash" />
                {line.name}
              </Tag>
              {tip && (
                <span role="tooltip" id={tip} className="bbar-tip">
                  {line.description}
                </span>
              )}
            </span>
          )
        })}
      </nav>
      {/* A named region: the right half is a landmark like the line switch (audit 08.11 §2 pkt 7). */}
      <section
        aria-label="Godziny otwarcia i kontakt"
        className="bbar-right flex items-center gap-5 self-stretch"
      >
        <OpeningStatus hours={hours} holidays={holidays} now={now} />
        {slot?.label && slot.href && (
          <a
            href={slot.href}
            className="flex items-center gap-[5px] self-stretch rounded-md font-bold text-nav-active-ink hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-nav-active-ink"
          >
            {slot.label}
            <Icon name="arrow" strokeWidth={2.4} className="size-[15px]" />
          </a>
        )}
        {phone && tel && (
          <a
            href={tel}
            className="flex items-center self-stretch rounded-md hover:text-nav-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-nav-active-ink"
          >
            <span>
              {phoneLabel && <>{phoneLabel} </>}
              <b className="font-extrabold text-nav-ink">{phone}</b>
            </span>
          </a>
        )}
        {phone && tel && phone2 && tel2 && (
          <a
            href={tel2}
            className="-ml-3 flex items-center self-stretch rounded-md hover:text-nav-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-nav-active-ink"
          >
            <span>
              <span aria-hidden="true">· </span>
              <span className="sr-only">lub </span>
              <b className="font-extrabold text-nav-ink">{phone2}</b>
            </span>
          </a>
        )}
      </section>
    </div>
  )
}
