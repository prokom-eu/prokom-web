'use client'

import { createContext, type ReactNode, useContext } from 'react'

import { cx } from '@/components/ui/cx'

const PanelActive = createContext(true)

/** Whether the tab panel around is the shown one — for pictures that move (`WeekTrack`). */
export const usePanelActive = () => useContext(PanelActive)

/**
 * Panels of self-switching tabs, all in one grid cell: the box is always as tall as the tallest
 * panel, so switching (also by itself, every few seconds) never moves the page below — no
 * layout shift. The hidden ones are `invisible` and `inert` (no focus, not read out). Panels
 * cross-fade in place: the old one fades out while the new one fades in, so the box is never
 * empty in between (audyt 01.11 P1 #17); `visibility` flips only at the end of the fade.
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
              'col-start-1 row-start-1 min-w-0 transition-[opacity,visibility] duration-300 ease-out motion-reduce:transition-none',
              shown ? 'visible opacity-100' : 'invisible opacity-0',
            )}
          >
            <PanelActive.Provider value={shown}>{panel}</PanelActive.Provider>
          </div>
        )
      })}
    </div>
  )
}
