'use client'

import Link from 'next/link'
import {
  type ComponentProps,
  type FocusEvent,
  type MouseEvent,
  type TouchEvent,
  useState,
} from 'react'

/**
 * `next/link` that prefetches only when the visitor shows intent — a pointer over it, a finger on
 * it or the focus (AUDYT-WYDAJNOSC-1111 #5). By default a link prefetches as soon as it comes into
 * view, so the capsule, the tab bar and the footer fetched every page they name in the background
 * on each visit (`prefetch={false}` would also drop the prefetch on hover in the App Router).
 * The pattern is Next's „Hover-triggered prefetch” (`docs/01-app/02-guides/prefetching.md`):
 * `false` until intent, then `null` — the default prefetch. Everything else passes to the link.
 */
export function IntentLink({
  onMouseEnter,
  onTouchStart,
  onFocus,
  ...rest
}: ComponentProps<typeof Link>) {
  const [intent, setIntent] = useState(false)
  return (
    <Link
      {...rest}
      prefetch={intent ? null : false}
      onMouseEnter={(event: MouseEvent<HTMLAnchorElement>) => {
        setIntent(true)
        onMouseEnter?.(event)
      }}
      onTouchStart={(event: TouchEvent<HTMLAnchorElement>) => {
        setIntent(true)
        onTouchStart?.(event)
      }}
      onFocus={(event: FocusEvent<HTMLAnchorElement>) => {
        setIntent(true)
        onFocus?.(event)
      }}
    />
  )
}
