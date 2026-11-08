'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

import { Icon } from '@/components/ui/Icon'
import { requestSearch } from '@/lib/site/searchOpen'
import { PROJECT_SEND_HREF } from '@/lib/software/project'

import { useProjectCount } from './ProjectCount'

export type SheetLink = { label: string; href: string; badge?: string }

const ITEM =
  'flex min-h-14 items-center justify-between gap-3 rounded-2xl px-4 text-lg font-extrabold text-ink hover:bg-surface-2 aria-[current=page]:bg-accent-soft aria-[current=page]:text-accent-text'

/**
 * The line's part of the shared menu sheet (SWA5, ZMIANY-v24 §3.7): search, „Twój projekt” while
 * the list has items, then the pages as large rows. Contact, status, the lines and the theme
 * switch are the shared part of the sheet below it.
 */
export function SwSheetList({ links }: { links: readonly SheetLink[] }) {
  const pathname = usePathname()
  const count = useProjectCount()
  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        aria-haspopup="dialog"
        onClick={(event) => {
          // The sheet closes first — the search window opens only when no other dialog is open.
          event.currentTarget.closest('dialog')?.close()
          window.setTimeout(() => requestSearch(), 0)
        }}
        className="flex min-h-12 w-full items-center gap-3 rounded-2xl bg-surface-2 px-4 text-left font-bold text-ink-2 shadow-[inset_0_0_0_1px_var(--border)]"
      >
        <Icon name="search" className="size-[18px]" />
        Szukaj na stronie
      </button>
      {count > 0 ? (
        <Link href={PROJECT_SEND_HREF} className={ITEM}>
          <span className="flex items-center gap-3">
            <Icon name="brief" className="size-5 text-accent-text" />
            Twój projekt
          </span>
          <span className="rounded-full bg-button px-2.5 py-0.5 text-sm text-accent-ink">
            {count}
          </span>
        </Link>
      ) : null}
      <ul className="flex flex-col">
        {links.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              className={ITEM}
              aria-current={pathname === link.href ? 'page' : undefined}
            >
              {link.label}
              {link.badge ? (
                <span className="rounded-full bg-accent px-2 py-0.5 text-xs text-accent-ink">
                  {link.badge}
                </span>
              ) : (
                <Icon name="arrow" className="size-4 text-ink-3" strokeWidth={2.4} />
              )}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
