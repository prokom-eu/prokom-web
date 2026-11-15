import type { ReactNode } from 'react'

import { cx } from '@/components/ui/cx'
import { BZ_H2 } from '@/sites/biznes/typography'

/**
 * A section of the product page (board `Strona`, widok produkt): „— LABEL”, the H2, an optional
 * lead and a note on the right (e.g. „13 parametrów”). The id is the anchor of the section bar.
 * Below 768 px (board App-Produkt): a 22 px H2 without the label.
 */
export function ProductSection({
  id,
  eyebrow,
  heading,
  lead,
  aside,
  action,
  children,
  className,
}: {
  id: string
  eyebrow: string
  heading: string
  lead?: ReactNode
  aside?: ReactNode
  /** A link or button on the right of the heading (e.g. „Cała oferta Lenovo →”). */
  action?: ReactNode
  children: ReactNode
  className?: string
}) {
  return (
    <section
      id={id}
      aria-labelledby={`${id}-h`}
      className={cx('scroll-mt-40 flex flex-col gap-4 md:gap-9', className)}
    >
      <div className="flex flex-wrap items-end justify-between gap-x-10 gap-y-4">
        <div className="max-w-[46rem]">
          <p className="mb-3 flex items-center gap-2.5 text-xs font-extrabold tracking-[0.12em] text-accent-text uppercase max-md:hidden">
            <span aria-hidden="true" className="h-0.5 w-4 rounded-full bg-current" />
            {eyebrow}
          </p>
          <h2
            id={`${id}-h`}
            className={`${BZ_H2} text-ink max-md:text-[22px] max-md:leading-[1.1]`}
          >
            {heading}
          </h2>
          {lead && (
            <div className="mt-3 text-[1.05rem] leading-relaxed text-ink-2 max-md:mt-2 max-md:text-[15px]">
              {lead}
            </div>
          )}
        </div>
        {action}
        {aside && (
          <span className="rounded-full bg-surface-2 px-3 py-1.5 text-xs font-extrabold text-ink-2">
            {aside}
          </span>
        )}
      </div>
      {children}
    </section>
  )
}
