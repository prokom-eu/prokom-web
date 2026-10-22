import Link from 'next/link'
import { Fragment } from 'react'

export type Crumb = { name: string; href: string }

/** Breadcrumbs of the Biznes pages; the last item is the current page. */
export function Breadcrumbs({ items }: { items: readonly Crumb[] }) {
  return (
    <nav aria-label="Okruszki" className="text-sm text-ink-3">
      <ol className="flex flex-wrap gap-2">
        {items.map((item, position) => {
          const current = position === items.length - 1
          return (
            <Fragment key={item.href}>
              {position > 0 && <li aria-hidden="true">/</li>}
              <li>
                <Link
                  href={item.href}
                  aria-current={current ? 'page' : undefined}
                  className={current ? 'text-ink' : 'hover:text-ink hover:underline'}
                >
                  {item.name}
                </Link>
              </li>
            </Fragment>
          )
        })}
      </ol>
    </nav>
  )
}
