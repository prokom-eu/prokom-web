import type { KeyboardEvent } from 'react'

/**
 * Tab lists of the „Dla architektów” page (spec §8: `tablist`/`tab`/`tabpanel` with the arrow
 * keys): the index a key moves to — arrows round, Home, End — or `null` for other keys.
 */
export function nextTab(key: string, i: number, n: number): number | null {
  if (n <= 0) return null
  if (key === 'ArrowRight' || key === 'ArrowDown') return (i + 1) % n
  if (key === 'ArrowLeft' || key === 'ArrowUp') return (i - 1 + n) % n
  if (key === 'Home') return 0
  if (key === 'End') return n - 1
  return null
}

/** Key handler of tab `i`: selects the tab the key moves to and focuses it. */
export function onTabKey(
  event: KeyboardEvent<HTMLElement>,
  i: number,
  n: number,
  select: (i: number) => void,
) {
  const next = nextTab(event.key, i, n)
  if (next === null) return
  event.preventDefault()
  select(next)
  const tabs = event.currentTarget.parentElement?.querySelectorAll<HTMLElement>('[role="tab"]')
  tabs?.[next]?.focus()
}
