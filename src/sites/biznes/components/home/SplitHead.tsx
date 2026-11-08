import type { ReactNode } from 'react'

import { BZ_H2, BZ_LEAD } from '@/sites/biznes/typography'

/**
 * Head of a home section with the lead on the right (board `Web-start` W2; prototype `.head`):
 * eyebrow and H2 left, lead (and an optional link) right; below 900 px stacked. The H2 has `id`
 * for the section's `aria-labelledby`.
 */
export function SplitHead({
  id,
  eyebrow,
  heading,
  lead,
  children,
}: {
  id: string
  eyebrow?: string | null
  heading: string
  lead?: string | null
  children?: ReactNode
}) {
  return (
    <div className="flex flex-col gap-4 pb-8 max-md:pb-4 min-[900px]:flex-row min-[900px]:items-end min-[900px]:justify-between min-[900px]:gap-10">
      <div className="flex flex-col gap-3">
        {eyebrow && (
          <p className="flex items-center gap-2 text-xs font-black tracking-[0.12em] text-accent-text uppercase">
            <span aria-hidden="true" className="h-0.5 w-5 bg-current" />
            {eyebrow}
          </p>
        )}
        <h2
          id={id}
          className={`${BZ_H2} max-w-[22ch] text-ink max-md:text-[22px] max-md:leading-[1.1]`}
        >
          {heading}
        </h2>
      </div>
      {(lead || children) && (
        <div className="flex max-w-[46ch] flex-col items-start gap-3">
          {lead && <p className={`${BZ_LEAD} text-ink-2 max-md:text-[15px]`}>{lead}</p>}
          {children}
        </div>
      )}
    </div>
  )
}
