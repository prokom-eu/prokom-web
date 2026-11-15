'use client'

import { useState } from 'react'

/**
 * `data-swap` for content that changes with a choice (a tab, an area, a department): nothing on
 * the first render (no animation on page load, the server HTML stays as it is), then `a` and `b`
 * by turns on each change — a new animation name restarts the fade-in (`motion.css` §4c).
 * State derived during render (React: „storing information from previous renders”).
 */
export function useSwap(value: unknown): { 'data-swap'?: 'a' | 'b' } {
  const [previous, setPrevious] = useState(value)
  const [flips, setFlips] = useState(0)
  if (!Object.is(previous, value)) {
    setPrevious(value)
    setFlips(flips + 1)
  }
  return flips === 0 ? {} : { 'data-swap': flips % 2 ? 'a' : 'b' }
}
