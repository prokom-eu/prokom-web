'use client'

import { useRef, useState, type KeyboardEvent, type ReactNode } from 'react'

import { useSwap } from '@/sites/biznes/components/motion/useSwap'

type Tab = { title: string; icon: ReactNode }

/**
 * Tabs of „Dla kogo” (ZAOPATRZENIE §2 pkt 4), ARIA tabs pattern: arrows, Home and End move
 * between the tabs (roving `tabindex`, automatic activation). Every panel is rendered by the
 * server; only `hidden` changes here, so all the text is in the HTML without JavaScript.
 */
export function WhoTabs({
  id,
  label,
  tabs,
  panels,
}: {
  id: string
  label: string
  tabs: Tab[]
  panels: ReactNode[]
}) {
  const [selected, setSelected] = useState(0)
  const refs = useRef<(HTMLButtonElement | null)[]>([])
  const swap = useSwap(selected)

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const last = tabs.length - 1
    const next =
      event.key === 'ArrowRight'
        ? selected === last
          ? 0
          : selected + 1
        : event.key === 'ArrowLeft'
          ? selected === 0
            ? last
            : selected - 1
          : event.key === 'Home'
            ? 0
            : event.key === 'End'
              ? last
              : null
    if (next === null) return
    event.preventDefault()
    setSelected(next)
    refs.current[next]?.focus()
  }

  return (
    <>
      <div className="zp-tabs" role="tablist" aria-label={label} onKeyDown={onKeyDown}>
        {tabs.map((tab, i) => (
          <button
            key={tab.title}
            ref={(element) => {
              refs.current[i] = element
            }}
            type="button"
            role="tab"
            id={`${id}-tab-${i}`}
            aria-selected={i === selected}
            aria-controls={`${id}-panel-${i}`}
            tabIndex={i === selected ? 0 : -1}
            className="zp-tab"
            onClick={() => setSelected(i)}
          >
            <span className="zp-tab-icon">{tab.icon}</span>
            {tab.title}
          </button>
        ))}
      </div>
      {panels.map((panel, i) => (
        <div
          key={i}
          role="tabpanel"
          id={`${id}-panel-${i}`}
          aria-labelledby={`${id}-tab-${i}`}
          hidden={i !== selected}
          tabIndex={0}
          className="zp-who"
          {...(i === selected ? swap : {})}
        >
          {panel}
        </div>
      ))}
    </>
  )
}
