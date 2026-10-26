'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { type ReactNode, useEffect, useId, useRef, useState } from 'react'

import { HomeAwareLink } from '@/components/HomeAwareLink'
import { Container } from '@/components/ui/Container'
import { cx } from '@/components/ui/cx'
import type { SoftwareNavigation } from '@/lib/software/navigation'

import { ChevronIcon, WandIcon } from './FrameIcons'

type Props = {
  items: SoftwareNavigation['header']
  /** Panel of „Oferta ▾”, rendered on the server. */
  mega: ReactNode
}

const ITEM =
  'inline-flex min-h-11 items-center gap-1.5 whitespace-nowrap rounded-xl px-1.5 text-sm font-bold text-ink-soft hover:bg-surface-2 hover:text-ink min-[1360px]:px-3 min-[1360px]:text-[15px]'

const pathOf = (href: string) =>
  href.startsWith('/') && !href.startsWith('//') ? (href.split(/[?#]/)[0] ?? null) : null

/**
 * Desktop menu of the Software header (spec. §3.1), above 1080 px, in the order of
 * `navigation.header`. „Oferta ▾” is a disclosure button (`aria-expanded`), not an ARIA menu —
 * the same behaviour as the Biznes header (`HeaderNav`): Esc (focus back on the button), a click
 * outside, focus leaving the panel and a route change close it. An item with `homeHref` leads to
 * the section of the start page while there (Kreator → `#dobierz`).
 */
export function SwHeaderNav({ items, mega }: Props) {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const navRef = useRef<HTMLElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const panelId = useId()

  const [shownPath, setShownPath] = useState(pathname)
  if (shownPath !== pathname) {
    setShownPath(pathname)
    setOpen(false)
  }

  useEffect(() => {
    if (!open) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return
      buttonRef.current?.focus()
      setOpen(false)
    }
    const onPointer = (event: PointerEvent) => {
      if (!navRef.current?.contains(event.target as Node)) setOpen(false)
    }
    document.addEventListener('keydown', onKey)
    document.addEventListener('pointerdown', onPointer)
    return () => {
      document.removeEventListener('keydown', onKey)
      document.removeEventListener('pointerdown', onPointer)
    }
  }, [open])

  return (
    <nav ref={navRef} aria-label="Główna" className="hidden min-[1081px]:block">
      <ul className="flex items-center gap-0.5 min-[1360px]:gap-1">
        {items.map((item) => {
          if ('mega' in item) {
            const current = pathname.startsWith('/rozwiazania')
            return (
              <li
                key={item.label}
                onBlur={(event) => {
                  // Tab past the last link of the panel closes it; a click on the panel's
                  // background (no `relatedTarget`) does not — clicks outside: `pointerdown`.
                  const next = event.relatedTarget
                  if (open && next && !event.currentTarget.contains(next)) setOpen(false)
                }}
              >
                <button
                  ref={buttonRef}
                  type="button"
                  aria-expanded={open}
                  aria-controls={panelId}
                  onClick={() => setOpen(!open)}
                  className={cx(ITEM, 'cursor-pointer', (open || current) && 'bg-chip text-ink')}
                >
                  {item.label}
                  <ChevronIcon open={open} className="size-3.5" />
                </button>
                {/* Positioned against the sticky header: the panel takes the page width. */}
                <div id={panelId} hidden={!open} className="absolute inset-x-0 top-full pt-1">
                  <Container wide>{mega}</Container>
                </div>
              </li>
            )
          }
          const current = pathOf(item.href) === pathname
          const className = cx(
            ITEM,
            item.pill &&
              'border border-accent-line bg-accent-soft text-accent-text hover:bg-accent-soft hover:text-accent-text',
            current && !item.pill && 'bg-chip text-ink',
          )
          const content = (
            <>
              {item.pill && <WandIcon />}
              {item.label}
              {item.badge && (
                <span className="rounded-full bg-button px-2 py-0.5 text-xs font-extrabold text-accent-ink">
                  {item.badge}
                </span>
              )}
            </>
          )
          return (
            <li key={item.label}>
              {item.homeHref ? (
                <HomeAwareLink
                  href={item.href}
                  homeHref={item.homeHref}
                  aria-current={current ? 'page' : undefined}
                  className={className}
                >
                  {content}
                </HomeAwareLink>
              ) : (
                <Link
                  href={item.href}
                  aria-current={current ? 'page' : undefined}
                  className={className}
                >
                  {content}
                </Link>
              )}
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
