import { cx } from '@/components/ui/cx'

export type Crumb = { name: string; path: string }

type Props = { items: readonly Crumb[]; onDark?: boolean; className?: string }

/**
 * Breadcrumbs of the shared page templates (spec §6.1 pkt 1): links up to the page itself, which is
 * plain text with `aria-current`. The same list feeds the `BreadcrumbList` (`lib/shared/pages`).
 */
export function PageCrumbs({ items, onDark, className }: Props) {
  return (
    <nav aria-label="Okruszki" className={cx('text-sm', className)}>
      <ol className="flex flex-wrap items-center gap-x-2 gap-y-1">
        {items.map((item, i) => {
          const last = i === items.length - 1
          return (
            <li key={item.path} className="flex items-center gap-2">
              {last ? (
                <span
                  aria-current="page"
                  className={cx('font-bold', onDark ? 'text-line-dark-ink' : 'text-ink')}
                >
                  {item.name}
                </span>
              ) : (
                <>
                  <a
                    href={item.path}
                    className={cx(
                      'underline-offset-4 hover:underline',
                      onDark ? 'text-line-dark-text' : 'text-ink-2',
                    )}
                  >
                    {item.name}
                  </a>
                  <span
                    aria-hidden="true"
                    className={onDark ? 'text-line-dark-text' : 'text-ink-2'}
                  >
                    /
                  </span>
                </>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
