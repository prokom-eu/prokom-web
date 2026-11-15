'use client'

import { type ReactNode, useId, useState } from 'react'

import { Container } from '@/components/ui/Container'
import { cx } from '@/components/ui/cx'
import { Icon } from '@/components/ui/Icon'

/**
 * A section folded to one row below 768 px (boards App-*: „Z opieką i bez”, „Dla kogo”): the
 * title and a short note, a tap unfolds the section. Closed is plain CSS (`max-md:hidden`), so
 * the first paint already matches the board; from 768 px the section is always open and the row
 * is not there. On a phone the row is the section's heading (an accordion: H2 with a button), so
 * the section's own head hides there (`data-folded`, see `SectionShell`); the panel is a region
 * named by this row, so a screen reader still hears the section's title (D12). Unfolding needs
 * JavaScript, as the rest of the phone frame (tab bar, inquiry).
 */
export function FoldOnPhone({
  title,
  note,
  children,
}: {
  title: string
  note?: string | null
  children: ReactNode
}) {
  const id = useId()
  const [open, setOpen] = useState(false)
  return (
    <>
      <Container wide className="py-2 md:hidden">
        <h2 id={`${id}-title`}>
          <button
            type="button"
            aria-expanded={open}
            aria-controls={`${id}-panel`}
            aria-describedby={note ? `${id}-note` : undefined}
            onClick={() => setOpen((value) => !value)}
            className="flex min-h-14 w-full items-center justify-between gap-3 rounded-[18px] bg-card px-4 py-3 text-left text-ink shadow-[inset_0_0_0_1px_var(--border)]"
          >
            <span className="flex min-w-0 flex-col">
              <span
                data-fold-title
                className="font-display text-[17px] leading-tight font-extrabold"
              >
                {title}
              </span>
              {note && (
                <span id={`${id}-note`} className="line-clamp-1 text-xs font-bold text-ink-2">
                  {note}
                </span>
              )}
            </span>
            <Icon
              name="arrow"
              strokeWidth={2.4}
              className={cx('size-4 shrink-0', open ? '-rotate-90' : 'rotate-90')}
            />
          </button>
        </h2>
      </Container>
      <div
        id={`${id}-panel`}
        role="region"
        aria-labelledby={`${id}-title`}
        data-folded=""
        className={cx(!open && 'max-md:hidden')}
      >
        {children}
      </div>
    </>
  )
}
