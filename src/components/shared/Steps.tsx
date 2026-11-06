import { cx } from '@/components/ui/cx'

export type Step = { title: string; text?: string | null; time?: string | null }

type Props = {
  steps: readonly Step[]
  /** `vertical` (dark card next to the form, Kontakt) or `horizontal` (O firmie). */
  orientation?: 'vertical' | 'horizontal'
  /** On the line's dark band: light text, on-dark accent. */
  onDark?: boolean
  className?: string
}

/**
 * „Jak pracujemy” of every line (spec §5 `Steps`, board Moduły): numbered tiles (the first in the
 * accent), a line joining them, title, optional time, description. An ordered list, so the order
 * is read out too.
 */
export function Steps({ steps, orientation = 'horizontal', onDark, className }: Props) {
  const horizontal = orientation === 'horizontal'
  return (
    <ol
      className={cx(
        'relative grid gap-6',
        horizontal ? 'min-[900px]:grid-flow-col min-[900px]:auto-cols-fr' : '',
        className,
      )}
      data-steps={orientation}
    >
      {steps.map((step, i) => (
        <li
          key={step.title}
          className={cx('relative flex gap-4', horizontal && 'min-[900px]:flex-col')}
        >
          {/* The joining line: down the side (vertical), along the top (horizontal, wide). */}
          {i < steps.length - 1 && (
            <span
              aria-hidden="true"
              className={cx(
                'absolute',
                onDark ? 'bg-line-dark-rule' : 'bg-border',
                horizontal
                  ? 'top-[52px] left-[22px] h-[calc(100%-28px)] w-0.5 min-[900px]:top-[22px] min-[900px]:left-[56px] min-[900px]:h-0.5 min-[900px]:w-[calc(100%-32px)]'
                  : 'top-[52px] left-[22px] h-[calc(100%-28px)] w-0.5',
              )}
            />
          )}
          <span
            className={cx(
              'relative z-[1] flex size-11 shrink-0 items-center justify-center rounded-xl font-display text-lg font-extrabold',
              i === 0
                ? onDark
                  ? 'bg-on-dark text-on-dark-ink'
                  : 'bg-accent text-accent-ink'
                : onDark
                  ? 'bg-line-dark-current text-line-dark-ink'
                  : 'bg-surface-2 text-accent-text',
            )}
          >
            {String(i + 1).padStart(2, '0')}
          </span>
          <span className="flex flex-col gap-1">
            <b
              className={cx(
                'font-display text-lg font-extrabold',
                onDark ? 'text-line-dark-ink' : 'text-ink',
              )}
            >
              {step.title}
            </b>
            {step.time && (
              <span
                className={cx(
                  'text-xs font-extrabold uppercase',
                  onDark ? 'text-on-dark-text' : 'text-accent-text',
                )}
              >
                {step.time}
              </span>
            )}
            {step.text && (
              <span className={onDark ? 'text-line-dark-text' : 'text-ink-2'}>{step.text}</span>
            )}
          </span>
        </li>
      ))}
    </ol>
  )
}
