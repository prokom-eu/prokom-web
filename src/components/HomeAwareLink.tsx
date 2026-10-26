'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { type ComponentProps, useSyncExternalStore } from 'react'

/** Other attributes (`aria-current`, `data-*`) pass to the link. */
type Props = Omit<ComponentProps<typeof Link>, 'href'> & { href: string; homeHref: string }

const noop = () => () => {}

/**
 * A link that leads to a section of the home page when it is already there (ZMIANY-v20 §1.1:
 * „Zgłoś awarię” → `#kontakt` on the home page, `/kontakt` elsewhere). The proxy rewrites
 * paths, so the server's pathname is not the visitor's (Next docs: `usePathname` and rewrites):
 * the server and hydration render the plain address, then the router's pathname decides — it
 * changes in the same render as a client-side navigation, unlike `window.location`.
 */
export function HomeAwareLink({ href, homeHref, ...rest }: Props) {
  const pathname = usePathname()
  const hydrated = useSyncExternalStore(
    noop,
    () => true,
    () => false,
  )
  return <Link href={hydrated && pathname === '/' ? homeHref : href} {...rest} />
}
