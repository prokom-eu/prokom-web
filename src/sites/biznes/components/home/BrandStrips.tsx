'use client'

import { useState, type ReactNode } from 'react'

import { BrandMarquee, useMotionAllowed } from '@/sites/biznes/components/procurement/BrandMarquee'
import { ProcIcon } from '@/sites/biznes/components/procurement/icons'

/**
 * The two brand strips of the home page (ZAOPATRZENIE §9): the upper moves left at 34 px/s, the
 * lower right at 28 px/s; both ease to a stop under the mouse, can be dragged, stop on keyboard
 * focus, and one button pauses both (WCAG 2.2.2). With reduced motion they stand (still
 * draggable) and the button goes.
 */
export function BrandStrips({ top, bottom }: { top: ReactNode; bottom: ReactNode | null }) {
  const [paused, setPaused] = useState(false)
  const moving = useMotionAllowed()
  return (
    <>
      <BrandMarquee
        label="Marki, rząd 1"
        speed={34}
        direction={-1}
        paused={paused}
        draggable
        className="zh-strip"
      >
        {top}
      </BrandMarquee>
      {bottom && (
        <BrandMarquee
          label="Marki, rząd 2"
          speed={28}
          direction={1}
          paused={paused}
          draggable
          className="zh-strip"
        >
          {bottom}
        </BrandMarquee>
      )}
      <div className="zh-strip-foot">
        <span>
          <ProcIcon name="hand" />
          {moving ? 'Najedź, żeby zwolnić · przeciągnij palcem' : 'Przeciągnij palcem'} · kliknij
          logo, żeby wejść do salonu marki
        </span>
        {moving && (
          // The visible text is the name (no `aria-pressed`: the label itself says the state).
          <button type="button" className="zh-pause" onClick={() => setPaused((p) => !p)}>
            <ProcIcon name={paused ? 'arrow' : 'pause'} />
            {paused ? 'Wznów animację' : 'Wstrzymaj animację'}
          </button>
        )}
      </div>
    </>
  )
}
