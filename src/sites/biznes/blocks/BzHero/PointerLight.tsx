'use client'

import { useEffect, useRef } from 'react'

/** Mouse only and motion allowed: a touch or reduced motion never starts the light. */
const FINE = '(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)'

/**
 * The light under the cursor on the hero's tiles (premium pass 15.11): one listener on the hero
 * section writes the pointer's place inside the pointed `[data-light]` tile as `--mx` / `--my`
 * (0–1), once per frame; the CSS draws the glow and the lit rim from them. Renders nothing.
 */
export function PointerLight() {
  const anchor = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const section = anchor.current?.closest('section')
    if (!section) return
    const media = window.matchMedia(FINE)
    let frame = 0
    const move = (event: PointerEvent) => {
      if (event.pointerType !== 'mouse') return
      const tile = (event.target as Element | null)?.closest<HTMLElement>('[data-light]')
      if (!tile) return
      const { clientX, clientY } = event
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() => {
        const box = tile.getBoundingClientRect()
        tile.style.setProperty('--mx', ((clientX - box.left) / box.width).toFixed(3))
        tile.style.setProperty('--my', ((clientY - box.top) / box.height).toFixed(3))
      })
    }
    const sync = () => {
      section.removeEventListener('pointermove', move)
      if (media.matches) section.addEventListener('pointermove', move, { passive: true })
    }
    sync()
    media.addEventListener('change', sync)
    return () => {
      cancelAnimationFrame(frame)
      media.removeEventListener('change', sync)
      section.removeEventListener('pointermove', move)
    }
  }, [])

  return <span ref={anchor} hidden />
}
