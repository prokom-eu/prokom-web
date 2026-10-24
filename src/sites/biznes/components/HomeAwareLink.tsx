'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSyncExternalStore, type ReactNode } from 'react'

type Props = { href: string; homeHref: string; className?: string; children: ReactNode }

const noop = () => () => {}

/**
 * A link that leads to a section of the home page when it is already there (ZMIANY-v20 §1.1:
 * „Zgłoś awarię” → `#kontakt` on the home page, `/kontakt` elsewhere). The proxy rewrites
 * paths, so the server's pathname is not the visitor's (Next docs: `usePathname` and rewrites):
 * the server and hydration render the plain address, then the router's pathname decides — it
 * changes in the same render as a client-side navigation, unlike `window.location`.
 */
export function HomeAwareLink({ href, homeHref, className, children }: Props) {
  const pathname = usePathname()
  const hydrated = useSyncExternalStore(
    noop,
    () => true,
    () => false,
  )
  return (
    <Link href={hydrated && pathname === '/' ? homeHref : href} className={className}>
      {children}
    </Link>
  )
}
