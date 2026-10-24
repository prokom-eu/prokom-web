'use client'

import { useEffect, useState } from 'react'

import { cx } from '@/components/ui/cx'
import { Icon } from '@/components/ui/Icon'
import type { IconName } from '@/lib/catalog/options'

export type RailItem = { id: string; label: string; icon: IconName }

/**
 * Floating section rail of the Biznes home page (spec. §3.7): icons on the left from 1400 px,
 * labels on hover or keyboard focus, the current section marked while scrolling
 * (IntersectionObserver). Plain anchor links — they work without JavaScript too.
 */
export function SectionRail({ items }: { items: RailItem[] }) {
  const [active, setActive] = useState(items[0]?.id ?? '')

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

  if (items.length < 2) return null
  return (
    <nav
      aria-label="Na tej stronie"
      className="group/rail fixed top-1/2 left-4 z-30 hidden -translate-y-1/2 min-[1400px]:block"
    >
      <ul className="flex w-11 flex-col gap-1 overflow-hidden rounded-[22px] bg-card p-1 shadow-[0_20px_40px_-28px_var(--glow),inset_0_0_0_1px_var(--border)] transition-[width] duration-200 group-focus-within/rail:w-[214px] group-hover/rail:w-[214px] motion-reduce:transition-none">
        {items.map((item) => {
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
