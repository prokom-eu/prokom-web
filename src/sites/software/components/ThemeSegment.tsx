'use client'

import { useTheme } from '@/components/useTheme'
import { cx } from '@/components/ui/cx'
import type { Theme } from '@/lib/brand/theme'

const OPTIONS: { value: Theme; label: string; icon: string }[] = [
  {
    value: 'light',
    label: 'Jasny',
    icon: 'M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8zM12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4',
  },
  { value: 'dark', label: 'Ciemny', icon: 'M12 3a9 9 0 1 0 9 9 7 7 0 0 1-9-9Z' },
]

/**
 * „Wygląd strony” of the phone menu (spec. §3.2, §3.5; `stany/80b`): the Jasny / Ciemny segment
 * on the same choice as the header's switch (`useTheme`, `pk-theme`). Two buttons with
 * `aria-pressed` in a labelled group.
 */
export function ThemeSegment({ label }: { label: string }) {
  const [theme, setTheme] = useTheme()
  return (
    <div role="group" aria-label={label} className="flex items-center justify-between gap-3">
      <span aria-hidden="true" className="font-bold">
        {label}
      </span>
      <div className="flex rounded-2xl bg-chip p-1">
        {OPTIONS.map((option) => {
          const active = theme === option.value
          return (
            <button
              key={option.value}
              type="button"
              aria-pressed={active}
              onClick={() => setTheme(option.value)}
              className={cx(
                'inline-flex min-h-11 items-center gap-2 rounded-xl px-3.5 font-bold',
                active ? 'bg-card text-ink shadow-raised' : 'text-ink-2',
              )}
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.9}
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
                focusable="false"
                className="size-[18px]"
              >
                <path d={option.icon} />
              </svg>
              {option.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}
