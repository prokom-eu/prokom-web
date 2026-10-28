import Link from 'next/link'

import { cx } from '@/components/ui/cx'

type Item = { name: string; href: string; count: number }

const CHIP =
  'inline-flex min-h-11 items-center gap-2 rounded-xl px-4 text-sm font-bold focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-accent-text'

/**
 * Subcategories with their own page (K3-KATALOG §9, `k31/screens/Web-Kategoria-1440`): links,
 * „Wszystkie” to the category; the current page is marked (`aria-current`).
 */
export function SubcategoryNav({
  category,
  items,
  current,
}: {
  category: Item
  items: Item[]
  /** Address of the page shown (the category or one subcategory). */
  current: string
}) {
  if (items.length === 0) return null
  return (
    <nav aria-label="Podkategorie" className="mb-8">
      <ul className="flex flex-wrap gap-2">
        {[{ ...category, name: 'Wszystkie' }, ...items].map((item) => {
          const on = item.href === current
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={on ? 'page' : undefined}
                className={cx(
                  CHIP,
                  on
                    ? 'bg-accent-text text-accent-ink'
                    : 'bg-card text-ink shadow-[inset_0_0_0_1px_var(--border)] hover:shadow-[inset_0_0_0_1px_var(--ink-3)]',
                )}
              >
                {item.name}
                {/* No opacity: on the accent fill it fails the contrast (dark theme). */}
                <span className={cx('text-xs font-extrabold', !on && 'text-ink-2')}>
                  {item.count}
                </span>
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
