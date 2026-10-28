import type { ReactNode } from 'react'

const EYEBROW =
  'flex items-center gap-2.5 text-xs font-extrabold tracking-[0.12em] text-accent-text uppercase'

/** Eyebrow and H2 of a showroom section (board `Strona` → MARKA). */
export function ShowroomHeading({
  id,
  eyebrow,
  children,
}: {
  id: string
  eyebrow: string
  children: ReactNode
}) {
  return (
    <div className="mb-6 sm:mb-8">
      <p className={EYEBROW}>
        <span aria-hidden="true" className="h-0.5 w-4 rounded-full bg-current" />
        {eyebrow}
      </p>
      <h2
        id={id}
        className="mt-3 font-display text-[clamp(1.7rem,3vw,2.6rem)] leading-[1.05] font-extrabold tracking-[-0.02em] font-stretch-110%"
      >
        {children}
      </h2>
    </div>
  )
}
