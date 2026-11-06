import { cx } from '@/components/ui/cx'
import { Icon } from '@/components/ui/Icon'

export type VerifyItem = { title: string; text?: string | null; href?: string | null }

type Props = { items: readonly VerifyItem[]; className?: string }

/**
 * „Nie musisz wierzyć nam na słowo” (spec §6.2 pkt 6, `VerifyCards`): four cards with an outside
 * source (CEIDG, producer lists, reviews) from `shared.about.verify`. A card with an address opens
 * it in a new tab; one without (a link still to come) is a plain card.
 */
export function VerifyCards({ items, className }: Props) {
  if (items.length === 0) return null
  return (
    <ul
      className={cx('grid gap-3 min-[640px]:grid-cols-2 min-[1000px]:grid-cols-4', className)}
      data-verify-cards
    >
      {items.map((item, i) => {
        const body = (
          <>
            <span className="flex size-10 items-center justify-center rounded-xl bg-accent-soft text-accent-text">
              <Icon name="shield" strokeWidth={2} />
            </span>
            <b className="font-display text-lg font-extrabold">{item.title}</b>
            {item.text && <span className="text-ink-2">{item.text}</span>}
            {item.href && (
              <span className="mt-auto inline-flex items-center gap-1 text-sm font-bold text-accent-text">
                Sprawdź <span aria-hidden="true">↗</span>
                <span className="sr-only"> (nowe okno)</span>
              </span>
            )}
          </>
        )
        const card = 'flex h-full flex-col gap-3 rounded-[22px] border border-border bg-card p-6'
        return (
          <li key={i}>
            {item.href ? (
              <a
                href={item.href}
                target="_blank"
                rel="noopener"
                className={cx(
                  card,
                  'hover:border-accent-text focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-text',
                )}
              >
                {body}
              </a>
            ) : (
              <div className={card}>{body}</div>
            )}
          </li>
        )
      })}
    </ul>
  )
}
