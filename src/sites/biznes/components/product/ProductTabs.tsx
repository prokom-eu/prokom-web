'use client'

import { useId, useRef, useState, type KeyboardEvent, type ReactNode } from 'react'

import { cx } from '@/components/ui/cx'

export type TabPanel = { id: string; label: string; content: ReactNode }

/**
 * Tabs of the product page (WAI-ARIA tabs: arrows, Home, End). Every panel stays in the HTML —
 * hidden ones with `hidden` — so search engines and „find in page” see all of the content.
 * One panel only → a plain section with its heading, no tab bar.
 */
export function ProductTabs({ panels }: { panels: TabPanel[] }) {
  const [active, setActive] = useState(0)
  const tabs = useRef<(HTMLButtonElement | null)[]>([])
  const id = useId()

  if (panels.length === 0) return null
  if (panels.length === 1) {
    const [panel] = panels
    return (
      <section aria-labelledby={`${id}-${panel!.id}`}>
        <h2
          id={`${id}-${panel!.id}`}
          className="font-display text-2xl font-extrabold text-ink font-stretch-110%"
        >
          {panel!.label}
        </h2>
        <div className="mt-5">{panel!.content}</div>
      </section>
    )
  }

  const focus = (position: number) => {
    const next = (position + panels.length) % panels.length
    setActive(next)
    tabs.current[next]?.focus()
  }
  const onKeyDown = (event: KeyboardEvent) => {
    const keys: Record<string, number> = {
      ArrowRight: active + 1,
      ArrowLeft: active - 1,
      Home: 0,
      End: panels.length - 1,
    }
    const target = keys[event.key]
    if (target === undefined) return
    event.preventDefault()
    focus(target)
  }

  return (
    <div>
      <div
        role="tablist"
        aria-label="Informacje o produkcie"
        onKeyDown={onKeyDown}
        className="inline-flex max-w-full gap-1 overflow-x-auto rounded-2xl bg-surface-2 p-1.5"
      >
        {panels.map((panel, position) => (
          <button
            key={panel.id}
            ref={(element) => {
              tabs.current[position] = element
            }}
            type="button"
            role="tab"
            id={`${id}-tab-${panel.id}`}
            aria-controls={`${id}-panel-${panel.id}`}
            aria-selected={active === position}
            tabIndex={active === position ? 0 : -1}
            onClick={() => setActive(position)}
            className={cx(
              'min-h-11 shrink-0 rounded-xl px-4 font-extrabold transition-colors',
              active === position
                ? 'bg-card text-ink shadow-[0_6px_16px_-10px_var(--glow)]'
                : 'text-ink-3 hover:text-ink',
            )}
          >
            {panel.label}
          </button>
        ))}
      </div>
      {panels.map((panel, position) => (
        <div
          key={panel.id}
          role="tabpanel"
          id={`${id}-panel-${panel.id}`}
          aria-labelledby={`${id}-tab-${panel.id}`}
          tabIndex={0}
          hidden={active !== position}
          className="mt-6"
        >
          {panel.content}
        </div>
      ))}
    </div>
  )
}
