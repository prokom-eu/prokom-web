'use client'

import { useRouter } from 'next/navigation'
import type { ComponentProps, MouseEvent } from 'react'

import { IntentLink as Link } from '@/components/shared/IntentLink'

type Props = Omit<ComponentProps<typeof Link>, 'href'> & {
  /** The solution's own page (`/rozwiazania/<slug>`): what search engines follow and index. */
  href: string
  /** Where a plain click goes instead: the offer window in the catalog (`?rozwiazanie=`). */
  open: string
}

const plainClick = (event: MouseEvent) =>
  event.button === 0 && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey

/**
 * A link to a solution (SEO etap 1): its `href` is the indexable page `/rozwiazania/<slug>` — the
 * offer window `?rozwiazanie=` is `noindex` with the catalog as canonical, so links to it gave the
 * 29 solution pages no internal links. A plain click still opens the offer window as before;
 * Ctrl/⌘-click, the middle button and no JavaScript open the page itself.
 */
export function SolutionLink({ href, open, onClick, ...rest }: Props) {
  const router = useRouter()
  return (
    <Link
      {...rest}
      href={href}
      onClick={(event) => {
        onClick?.(event)
        if (event.defaultPrevented || !plainClick(event)) return
        event.preventDefault()
        router.push(open)
      }}
    />
  )
}
