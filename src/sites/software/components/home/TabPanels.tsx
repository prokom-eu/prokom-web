'use client'

import { createContext, type ReactNode, useContext } from 'react'

import { cx } from '@/components/ui/cx'

const PanelActive = createContext(true)

/** Whether the tab panel around is the shown one — for pictures that move (`WeekTrack`). */
export const usePanelActive = () => useContext(PanelActive)

/**
 * Panels of self-switching tabs, all in one grid cell: the box is always as tall as the tallest
 * panel, so switching (also by itself, every few seconds) never moves the page below — no
 * layout shift. The hidden ones are `invisible` and `inert` (no focus, not read out).
 */
export function TabPanels({
  id,
  panels,
  active,
}: {
  /** Prefix of the ids shared with the tabs (`<id>-tab-<i>`, `<id>-panel-<i>`). */
  id: string
  panels: ReactNode[]
  active: number
}) {
  return (
    <div className="grid">
      {panels.map((panel, i) => {
        const shown = i === active
        return (
          <div
            key={i}
            role="tabpanel"
            id={`${id}-panel-${i}`}
            aria-labelledby={`${id}-tab-${i}`}
            inert={!shown}
            className={cx(
              'col-start-1 row-start-1 min-w-0',
              shown ? 'motion-safe:animate-pane' : 'invisible',
            )}
          >
            <PanelActive.Provider value={shown}>{panel}</PanelActive.Provider>
          </div>
        )
      })}
    </div>
  )
}
