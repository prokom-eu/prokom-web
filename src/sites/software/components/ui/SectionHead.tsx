import { cx } from '@/components/ui/cx'

type Props = {
  eyebrow: string
  /** First part of the H2. */
  title: string
  /** Second part, in the violet gradient (`.sw-em`); ZMIANY-v24 §2: „eyebrow → H2 z `em`”. */
  em?: string | null
  lead?: string | null
  /** `h1` for the heading of a subpage hero (`.sw-h1-page`, `em` in the hero gradient). */
  level?: 'h1' | 'h2'
  align?: 'start' | 'center'
  /** Id of the heading (`aria-labelledby` of its section, anchors). */
  id?: string
  className?: string
}

/**
 * Heading of a Software v24 section: eyebrow, H2 with its highlighted part, lead. Rises in on
 * scroll (`data-rise`) and „arrives” after a glide of the rail (motion.css §6).
 */
export function SectionHead({
  eyebrow,
  title,
  em,
  lead,
  level = 'h2',
  align = 'start',
  id,
  className,
}: Props) {
  const Heading = level
  return (
    <div
      className={cx(
        'flex max-w-[760px] flex-col gap-4',
        align === 'center' && 'mx-auto items-center text-center',
        className,
      )}
    >
      <p className="sw-eyebrow" data-rise>
        {eyebrow}
      </p>
      <Heading id={id} className={level === 'h1' ? 'sw-h1-page' : 'sw-h2'} data-rise>
        {title}
        {em ? (
          <>
            {' '}
            <em className={level === 'h1' ? 'sw-em-hero' : 'sw-em'}>{em}</em>
          </>
        ) : null}
      </Heading>
      {lead ? (
        <p className="max-w-[56ch] text-lg text-ink-2" data-rise>
          {lead}
        </p>
      ) : null}
    </div>
  )
}
