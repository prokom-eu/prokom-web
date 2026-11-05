import { cx } from '@/components/ui/cx'
import { Icon } from '@/components/ui/Icon'
import type { SharedLine } from '@/lib/shared/project'
import type { SharedLineKey } from '@/lib/shared/lines'
import type { OpeningHours } from '@/lib/shared/openingStatus'
import { toTelHref } from '@/lib/site/link'

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
  /** „Biznes:” — `shared.phoneLabel`. */
  phoneLabel?: string | null
  className?: string
}

/** Gaming last, whatever its order in the panel (spec §2.4, §5 `BrandBar`). */
const ordered = (lines: readonly SharedLine[]) => [
  ...lines.filter((line) => line.key !== 'gaming'),
  ...lines.filter((line) => line.key === 'gaming'),
]

/**
 * Brand bar above the header capsule (spec §5 `BrandBar`, NAGLOWEK-KAPSULA §2–3): the line switch
 * on the left, opening status, the line's link and phone on the right. 38 px, no background — it
 * scrolls away with the page. Hidden up to 1080 px (the phone menu sheet carries the same).
 */
export function BrandBar({
  lines,
  current,
  hours,
  holidays,
  now,
  slot,
  phone,
  phoneLabel,
  className,
}: BrandBarProps) {
  const tel = phone ? toTelHref(phone) : null
  return (
    <div
      className={cx(
        'mx-auto hidden h-[38px] w-full max-w-[1280px] items-center justify-between gap-6 px-8 text-[12.5px] text-nav-ink-2 min-[1081px]:flex min-[1360px]:px-0',
        className,
      )}
      data-brand-bar
    >
      <nav aria-label="Linie PRO-KOM" className="flex items-center gap-[18px]">
        {ordered(lines).map((line) => {
          const isCurrent = line.key === current
          return (
            <a
              key={line.key}
              href={line.url ?? undefined}
              aria-current={isCurrent ? 'page' : undefined}
              className={cx(
                'flex items-center gap-[7px] rounded-md hover:text-nav-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-nav-active-ink',
                isCurrent ? 'font-extrabold text-nav-ink' : 'font-semibold',
              )}
            >
              <i
                aria-hidden="true"
                className="block h-[3px] w-[11px] rounded-[2px]"
                // The line's brand colour from the panel; Gaming's gold is darker on the bar (§2.4).
                style={{
                  background:
                    line.key === 'gaming' ? 'var(--gaming-dash)' : (line.color ?? 'currentColor'),
                }}
              />
              {line.name}
            </a>
          )
        })}
      </nav>
      <div className="flex items-center gap-5">
        <OpeningStatus hours={hours} holidays={holidays} now={now} />
        {slot?.label && slot.href && (
          <a
            href={slot.href}
            className="flex items-center gap-[5px] rounded-md font-bold text-nav-active-ink hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-nav-active-ink"
          >
            {slot.label}
            <Icon name="arrow" strokeWidth={2.4} className="size-[15px]" />
          </a>
        )}
        {phone && tel && (
          <a
            href={tel}
            className="rounded-md hover:text-nav-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-nav-active-ink"
          >
            {phoneLabel && <>{phoneLabel} </>}
            <b className="font-extrabold text-nav-ink">{phone}</b>
          </a>
        )}
      </div>
    </div>
  )
}
