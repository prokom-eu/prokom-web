'use client'

import { useEffect, useState, useSyncExternalStore } from 'react'

import { cx } from '@/components/ui/cx'
import { Icon } from '@/components/ui/Icon'
import type { IconName } from '@/lib/catalog/options'

export type RailItem = { id: string; label: string; icon: IconName }

/** Width from which the rail shows: Biznes from 1400 px (spec. §3.7), Software above 1400 px (§3.3). */
const FROM = {
  1400: 'min-[1400px]:block',
  1401: 'min-[1401px]:block',
} as const

type Props = { items: RailItem[]; from?: keyof typeof FROM }

const noSubscription = () => () => {}

/**
 * Floating section rail of a start page (Biznes spec. §3.7, Software spec. §3.3): icons on the
 * left on wide screens, labels on hover or keyboard focus, the current section marked while
 * scrolling (IntersectionObserver). Plain anchor links — they work without JavaScript too.
 */
export function SectionRail({ items, from = 1400 }: Props) {
  const [active, setActive] = useState(items[0]?.id ?? '')
  // Sections found on the page: a block may render nothing (texts missing in the panel), and
  // the rail must not link to a section that is not there (Software spec. §3.3). The anchors do
  // not change while the page is open; on the server every item counts.
  const present = useSyncExternalStore(
    noSubscription,
    () =>
      items
        .filter((item) => document.getElementById(item.id))
        .map((item) => item.id)
        .join(' '),
    () => null,
  )

  useEffect(() => {
    const sections = items.flatMap((item) => document.getElementById(item.id) ?? [])
    // A section counts as current while it crosses the middle of the screen.
    const observer = new IntersectionObserver(
      (entries) => {
        const hit = entries.find((entry) => entry.isIntersecting)
        if (hit) setActive(hit.target.id)
      },
      { rootMargin: '-45% 0px -50% 0px' },
    )
    sections.forEach((section) => observer.observe(section))
    return () => observer.disconnect()
  }, [items])

  const shown =
    present === null ? items : items.filter((item) => present.split(' ').includes(item.id))
  if (shown.length < 2) return null
  return (
    <nav
      aria-label="Na tej stronie"
      className={cx('group/rail fixed top-1/2 left-4 z-30 hidden -translate-y-1/2', FROM[from])}
    >
      <ul className="flex w-11 flex-col gap-1 overflow-hidden rounded-[22px] bg-card p-1 shadow-[0_20px_40px_-28px_var(--glow),inset_0_0_0_1px_var(--border)] transition-[width] duration-200 group-focus-within/rail:w-[214px] group-hover/rail:w-[214px] motion-reduce:transition-none">
        {shown.map((item) => {
          const current = item.id === active
          return (
            <li key={item.id}>
              <a
                href={`#${item.id}`}
                aria-current={current ? 'true' : undefined}
                className={cx(
                  'flex h-9 items-center gap-3 rounded-[14px] px-2 text-sm font-bold whitespace-nowrap',
                  current
                    ? 'bg-accent-text text-accent-ink'
                    : 'text-ink-2 hover:bg-surface-2 hover:text-ink',
                )}
              >
                <Icon name={item.icon} className="size-5" />
                {item.label}
              </a>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
