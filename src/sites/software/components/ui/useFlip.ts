'use client'

import { useLayoutEffect, useRef, type RefObject } from 'react'

const MOVE_MS = 380
const ENTER_MS = 320

/**
 * Cards of a filtered grid glide to their new places instead of jumping (FLIP, AUDYT-0811 P2 A7):
 * after each change of `key` the children of `list` that were there before slide from their old
 * offset (`transform`), the new ones fade in from 10 px below. Offsets within the list, so page
 * scrolling does not matter. Reduced motion: no animation.
 */
export function useFlip(list: RefObject<HTMLElement | null>, key: unknown) {
  const last = useRef(new Map<string, { x: number; y: number }>())

  useLayoutEffect(() => {
    const box = list.current
    if (!box) return
    const items = Array.from(box.children) as HTMLElement[]
    const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const before = last.current
    const now = new Map<string, { x: number; y: number }>()
    for (const item of items) {
      const id = item.dataset.flip
      if (!id) continue
      const at = { x: item.offsetLeft, y: item.offsetTop }
      now.set(id, at)
      if (still || before.size === 0 || typeof item.animate !== 'function') continue
      const was = before.get(id)
      if (!was) {
        item.animate(
          [
            { opacity: 0, transform: 'translateY(10px)' },
            { opacity: 1, transform: 'none' },
          ],
          { duration: ENTER_MS, easing: 'cubic-bezier(0.22, 1, 0.36, 1)' },
        )
      } else if (was.x !== at.x || was.y !== at.y) {
        item.animate(
          [{ transform: `translate(${was.x - at.x}px, ${was.y - at.y}px)` }, { transform: 'none' }],
          { duration: MOVE_MS, easing: 'cubic-bezier(0.22, 1, 0.36, 1)' },
        )
      }
    }
    last.current = now
  }, [list, key])
}
