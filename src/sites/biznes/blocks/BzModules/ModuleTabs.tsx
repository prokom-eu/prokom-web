'use client'

import { type KeyboardEvent, type ReactNode, useId, useRef, useState } from 'react'

import { cx } from '@/components/ui/cx'
import { Icon } from '@/components/ui/Icon'
import type { IconName } from '@/lib/catalog/options'

export type ModuleTab = { name: string; subtitle?: string | null; icon: IconName }

const KEYS: Record<string, (index: number, count: number) => number> = {
  ArrowDown: (i, n) => (i + 1) % n,
  ArrowRight: (i, n) => (i + 1) % n,
  ArrowUp: (i, n) => (i - 1 + n) % n,
  ArrowLeft: (i, n) => (i - 1 + n) % n,
  Home: () => 0,
  End: (_, n) => n - 1,
}

/**
 * Tabs of the module explorer (ARIA tabs, automatic activation): arrows, Home and End move the
 * choice; the panels come rendered from the server, only the chosen one is shown.
 */
export function ModuleTabs({ tabs, panels }: { tabs: ModuleTab[]; panels: ReactNode[] }) {
  const id = useId()
  const [chosen, setActive] = useState(0)
  // Live preview may remove modules: never point past the list.
  const active = Math.min(chosen, tabs.length - 1)
  const buttons = useRef<(HTMLButtonElement | null)[]>([])

  function onKeyDown(event: KeyboardEvent) {
    const move = KEYS[event.key]
    if (!move) return
    event.preventDefault()
    const next = move(active, tabs.length)
    setActive(next)
    buttons.current[next]?.focus()
  }

  return (
    <div className="grid gap-5 min-[1000px]:grid-cols-[minmax(0,0.42fr)_minmax(0,1fr)]">
      <div
        role="tablist"
        aria-label="Moduły"
        aria-orientation="vertical"
        onKeyDown={onKeyDown}
        className="flex flex-col gap-1"
      >
        {tabs.map((tab, i) => {
          const selected = i === active
          return (
            <button
              key={`${tab.name}-${i}`}
              ref={(element) => {
                buttons.current[i] = element
              }}
              type="button"
              role="tab"
              id={`${id}-tab-${i}`}
              aria-selected={selected}
              aria-controls={`${id}-panel-${i}`}
              tabIndex={selected ? 0 : -1}
              onClick={() => setActive(i)}
              className={cx(
                'flex items-center gap-3.5 rounded-2xl px-3.5 py-3 text-left transition-[background-color,box-shadow]',
                selected
                  ? 'bg-card shadow-[0_14px_30px_-20px_var(--glow),inset_0_0_0_1px_var(--border)]'
                  : 'hover:bg-card/60',
              )}
            >
              <span
                aria-hidden="true"
                className={cx(
                  'flex size-10 shrink-0 items-center justify-center rounded-xl',
                  selected
                    ? 'bg-linear-145 from-tone-green to-tone-green-2 text-white'
                    : 'text-ok-text',
                )}
              >
                <Icon name={tab.icon} className="size-5" />
              </span>
              <span className="min-w-0">
                <span className="block font-bold text-ink">{tab.name}</span>
                {tab.subtitle && (
                  <span className="block text-[13px] text-ink-2">{tab.subtitle}</span>
                )}
              </span>
            </button>
          )
        })}
      </div>
      {panels.map((panel, i) => (
        <div
          key={i}
          role="tabpanel"
          id={`${id}-panel-${i}`}
          aria-labelledby={`${id}-tab-${i}`}
          hidden={i !== active}
          data-testid="module-panel"
        >
          {panel}
        </div>
      ))}
    </div>
  )
}
