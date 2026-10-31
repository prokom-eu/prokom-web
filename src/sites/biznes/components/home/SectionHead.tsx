import Link from 'next/link'
import type { ReactNode } from 'react'

import { Icon } from '@/components/ui/Icon'

type Props = {
  id: string
  eyebrow?: string | null
  heading: ReactNode
  lead?: string | null
  /** Outlined link on the right (e.g. „Cały katalog · 225 pozycji”). */
  action?: { label: ReactNode; href: string } | null
  /** Colour of the label; the accent by default (GoPOS sections: `text-ok-text`). */
  eyebrowClassName?: string
}

/**
 * Head of a home page section (board `Main`): small accent label, large H2, lead and an
 * optional outlined link on the right. The H2 has `id` for the section's `aria-labelledby`.
 */
export function SectionHead({
  id,
  eyebrow,
  heading,
  lead,
  action,
  eyebrowClassName = 'text-accent-text',
}: Props) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-x-10 gap-y-6">
      <div className="max-w-[46rem]">
        {eyebrow && (
          <p
            className={`mb-3 text-[13px] font-extrabold tracking-[0.08em] uppercase ${eyebrowClassName}`}
          >
            {eyebrow}
          </p>
        )}
        <h2
          id={id}
          className="font-display text-[clamp(2rem,4vw,3.4rem)] leading-[1.02] font-extrabold tracking-[-0.02em] text-balance font-stretch-110%"
        >
          {heading}
        </h2>
        {lead && (
          <p className="mt-4 text-[clamp(1.0625rem,1.3vw,1.2rem)] leading-relaxed text-ink-2">
            {lead}
          </p>
        )}
      </div>
      {action && (
        <Link
          href={action.href}
          className="inline-flex min-h-12 items-center gap-2 rounded-2xl bg-card px-5 font-extrabold text-ink shadow-[inset_0_0_0_1.5px_var(--border)] transition-shadow hover:shadow-[inset_0_0_0_1.5px_var(--ink-3)]"
        >
          {action.label}
          <Icon name="arrow" strokeWidth={2.4} className="size-4" />
        </Link>
      )}
    </div>
  )
}
