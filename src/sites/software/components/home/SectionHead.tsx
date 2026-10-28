import { cx } from '@/components/ui/cx'

type Props = {
  eyebrow: string
  title: string
  lead: string
  /** Lead next to the heading from 1081 px (board `Main`: „12 rzeczy”), else under it. */
  aside?: boolean
  className?: string
}

/** Eyebrow, H2 and lead of a start page section (board `Main`). */
export function SectionHead({ eyebrow, title, lead, aside = false, className }: Props) {
  return (
    <div
      className={cx(
        'flex flex-col gap-4',
        aside &&
          'min-[1081px]:flex-row min-[1081px]:items-end min-[1081px]:justify-between min-[1081px]:gap-10',
        className,
      )}
    >
      <div className="flex max-w-[680px] flex-col gap-2.5">
        <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-accent-text min-[640px]:text-sm">
          {eyebrow}
        </p>
        <h2 className="font-display text-[32px] font-extrabold leading-[1.02] tracking-tight min-[640px]:text-5xl min-[1081px]:text-[56px]">
          {title}
        </h2>
      </div>
      <p
        className={cx(
          'text-lg text-ink-2 min-[640px]:text-xl',
          aside ? 'max-w-[46ch]' : 'max-w-[40ch]',
        )}
      >
        {lead}
      </p>
    </div>
  )
}
