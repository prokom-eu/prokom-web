'use client'

import { useLayoutEffect, useRef } from 'react'

/**
 * The pill under the active chip or tab that slides to the next one (AUDYT-0811 P2 A5, A6):
 * placed as the last child of the row, it measures the child matching `selector` and moves there
 * with `transform` — no layout library. Until it has measured, the row keeps its own active look
 * (`data-has-mark` on the row switches that off in CSS).
 */
export function SlidingMark({ selector }: { selector: string }) {
  const ref = useRef<HTMLSpanElement>(null)

  useLayoutEffect(() => {
    const mark = ref.current
    const row = mark?.parentElement
    if (!mark || !row) return
    let frame = 0
    const place = () => {
      frame = 0
      const on = row.querySelector<HTMLElement>(`:scope > ${selector}`)
      if (!on) {
        row.removeAttribute('data-has-mark')
        return
      }
      mark.style.width = `${on.offsetWidth}px`
      mark.style.height = `${on.offsetHeight}px`
      mark.style.transform = `translate(${on.offsetLeft}px, ${on.offsetTop}px)`
      if (!row.hasAttribute('data-has-mark')) {
        row.setAttribute('data-has-mark', '')
        // The first placement jumps; only later moves slide.
        requestAnimationFrame(() => mark.setAttribute('data-ready', ''))
      }
    }
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(place)
    }
    place()
    const changes = new MutationObserver(schedule)
    changes.observe(row, {
      subtree: true,
      childList: true,
      attributes: true,
      attributeFilter: ['aria-pressed', 'aria-selected'],
    })
    const sizes = new ResizeObserver(schedule)
    sizes.observe(row)
    return () => {
      if (frame) cancelAnimationFrame(frame)
      changes.disconnect()
      sizes.disconnect()
      row.removeAttribute('data-has-mark')
    }
  }, [selector])

  return <span ref={ref} className="sw-mark" aria-hidden="true" />
}
