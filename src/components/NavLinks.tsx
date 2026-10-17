'use client'

import { usePathname } from 'next/navigation'

import { cx } from './ui/cx'

type Link = { label: string; href: string }

/** Path of a link as the browser shows it (`/kontakt`), or `null` for external and other links. */
function internalPath(href: string): string | null {
  return href.startsWith('/') && !href.startsWith('//') ? (href.split(/[?#]/)[0] ?? null) : null
}

/**
 * Main navigation from `SiteSettings`; the current page gets `aria-current` and the accent rule
 * (the signature dash). A Client Component only for `usePathname`.
 */
export function NavLinks({ links, className }: { links: Link[]; className?: string }) {
  const pathname = usePathname()
  return (
    <ul className={className}>
      {links.map((link, i) => {
        const current = internalPath(link.href) === pathname
        return (
          <li key={`${i}-${link.href}`}>
            <a
              href={link.href}
              aria-current={current ? 'page' : undefined}
              className={cx(
                'relative inline-flex min-h-11 items-center px-1 font-semibold text-ink',
                'after:absolute after:inset-x-1 after:bottom-1.5 after:h-1 after:rounded-full',
                current ? 'after:bg-accent' : 'hover:after:bg-border',
              )}
            >
              {link.label}
            </a>
          </li>
        )
      })}
    </ul>
  )
}
