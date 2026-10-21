'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

import { Icon } from '@/components/ui/Icon'

/**
 * Quick links of the top bar (spec. §3.1, v20): "Zgłoś awarię" goes to the contact form —
 * on the home page its section (`#kontakt`), elsewhere the contact page — and "Aktualności".
 * No remote help here since v20: it lives on `/opieka-it` only.
 */
export function TopBarLinks() {
  const home = usePathname() === '/'
  const links = [
    { label: 'Zgłoś awarię', href: home ? '#kontakt' : '/kontakt', icon: 'wrench' },
    { label: 'Aktualności', href: '/aktualnosci', icon: 'doc' },
  ] as const
  return (
    <ul className="flex flex-wrap items-center gap-x-5">
      {links.map((link) => (
        <li key={link.label}>
          <Link
            href={link.href}
            className="inline-flex min-h-7 items-center gap-1.5 font-semibold text-accent-text hover:underline"
          >
            <Icon name={link.icon} className="size-4" strokeWidth={2} />
            {link.label}
          </Link>
        </li>
      ))}
    </ul>
  )
}
