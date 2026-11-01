import Link from 'next/link'
import { Fragment } from 'react'

export type Crumb = { name: string; href: string }

/** Breadcrumbs of the Biznes pages; the last item is the current page. `onDark`: on a navy hero. */
export function Breadcrumbs({
  items,
  onDark = false,
}: {
  items: readonly Crumb[]
  onDark?: boolean
}) {
  return (
    <nav aria-label="Okruszki" className={onDark ? 'text-sm text-white/75' : 'text-sm text-ink-2'}>
      <ol className="flex flex-wrap gap-2">
        {items.map((item, position) => {
          const current = position === items.length - 1
          return (
            <Fragment key={item.href}>
              {position > 0 && <li aria-hidden="true">/</li>}
              <li>
                {current ? (
                  // The page itself: text, not a link to where you already are (K4 board).
                  <span aria-current="page" className={onDark ? 'text-white' : 'text-ink'}>
                    {item.name}
                  </span>
                ) : (
                  <Link
                    href={item.href}
                    className={
                      onDark ? 'hover:text-white hover:underline' : 'hover:text-ink hover:underline'
                    }
                  >
                    {item.name}
                  </Link>
                )}
              </li>
            </Fragment>
          )
        })}
      </ol>
    </nav>
  )
}
