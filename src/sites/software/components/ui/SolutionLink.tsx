'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import type { ComponentProps, MouseEvent } from 'react'

type Props = Omit<ComponentProps<typeof Link>, 'href' | 'prefetch'> & {
  /** The solution's own page (`/rozwiazania/<slug>`): what search engines follow and index. */
  href: string
  /** Where a plain click goes instead: the offer window in the catalog (`?rozwiazanie=`). */
  open: string
  /**
   * Prefetch `open` on intent. Off where a click opens the window in place (the catalog, price
   * and industry cards): there is nothing to fetch, and 29 cards would each fetch `?rozwiazanie=`
   * (AUDYT-WYDAJNOSC-1111: 29 of 43 prefetches).
   */
  prefetchOpen?: boolean
}

/** A left click with no modifier: the click that follows the link in place. */
export const plainClick = (event: MouseEvent) =>
  event.button === 0 && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey

/**
 * A link to a solution (SEO etap 1): its `href` is the indexable page `/rozwiazania/<slug>` — the
 * offer window `?rozwiazanie=` is `noindex` with the catalog as canonical, so links to it gave the
 * 29 solution pages no internal links. A plain click still opens the offer window as before;
 * Ctrl/⌘-click, the middle button and no JavaScript open the page itself. On intent (a pointer,
 * a finger, the focus) it prefetches where the click goes — the window — not the page
 * (`IntentLink`'s pattern, AUDYT-WYDAJNOSC-1111 #5).
 */
export function SolutionLink({
  href,
  open,
  onClick,
  onMouseEnter,
  onTouchStart,
  onFocus,
  prefetchOpen = true,
  ...rest
}: Props) {
  const router = useRouter()
  const intent = () => {
    if (prefetchOpen) router.prefetch(open)
  }
  return (
    <Link
      {...rest}
      href={href}
      prefetch={false}
      onMouseEnter={(event) => {
        intent()
        onMouseEnter?.(event)
      }}
      onTouchStart={(event) => {
        intent()
        onTouchStart?.(event)
      }}
      onFocus={(event) => {
        intent()
        onFocus?.(event)
      }}
      onClick={(event) => {
        onClick?.(event)
        if (event.defaultPrevented || !plainClick(event)) return
        event.preventDefault()
        router.push(open)
      }}
    />
  )
}
