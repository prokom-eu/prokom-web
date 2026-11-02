import Link from 'next/link'
import type { ReactNode } from 'react'

import { cx } from '@/components/ui/cx'
import { Icon } from '@/components/ui/Icon'
import { BZ_H2, BZ_LEAD } from '@/sites/biznes/typography'

type Props = {
  id: string
  eyebrow?: string | null
  heading: ReactNode
  lead?: string | null
  /** Outlined link on the right (e.g. „Cały katalog · 225 pozycji”). */
  action?: { label: ReactNode; href: string } | null
  /** Colour of the label; the accent by default (GoPOS sections: `text-ok-text`). */
  eyebrowClassName?: string
  /**
   * Below 768 px as the phone screens (board App-Start): a 22 px H2 with a short text link on the
   * right (`phoneAction`, else the action's own label), no eyebrow and no lead.
   */
  appOnPhone?: boolean
  phoneAction?: string
}

/**
 * Head of a home page section (board `Main`): small accent label, large H2, lead and an
 * optional outlined link on the right. The H2 has `id` for the section's `aria-labelledby`.
 */
const PHONE_HIDDEN = 'max-md:hidden'
export function SectionHead({
  id,
  eyebrow,
  heading,
  lead,
  action,
  eyebrowClassName = 'text-accent-text',
  appOnPhone = false,
  phoneAction,
}: Props) {
  const phone = appOnPhone ? PHONE_HIDDEN : undefined
  return (
    <div
      className={cx(
        'flex flex-wrap items-end justify-between gap-x-10 gap-y-6',
        appOnPhone && 'max-md:flex-nowrap max-md:gap-x-4',
      )}
    >
      <div className="max-w-[46rem]">
        {eyebrow && (
          <p
            className={cx(
              'mb-3 text-[13px] font-extrabold tracking-[0.08em] uppercase',
              eyebrowClassName,
              phone,
            )}
          >
            {eyebrow}
          </p>
        )}
        <h2 id={id} className={cx(BZ_H2, appOnPhone && 'max-md:text-[22px] max-md:leading-[1.1]')}>
          {heading}
        </h2>
        {lead && <p className={cx(BZ_LEAD, 'mt-4 text-ink-2', phone)}>{lead}</p>}
      </div>
      {action && appOnPhone && (
        <Link
          href={action.href}
          className="inline-flex min-h-11 shrink-0 items-center text-[14px] font-extrabold text-accent-text md:hidden"
        >
          {phoneAction ?? action.label}
        </Link>
      )}
      {action && (
        <Link
          href={action.href}
          className={cx(
            'inline-flex min-h-12 items-center gap-2 rounded-2xl bg-card px-5 font-extrabold text-ink shadow-[inset_0_0_0_1.5px_var(--border)] transition-shadow hover:shadow-[inset_0_0_0_1.5px_var(--ink-3)]',
            phone,
          )}
        >
          {action.label}
          <Icon name="arrow" strokeWidth={2.4} className="size-4" />
        </Link>
      )}
    </div>
  )
}
