'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { type ReactNode, useEffect, useId, useRef, useState } from 'react'

import { cx } from '@/components/ui/cx'
import type { PublicBiznesNavigation } from '@/lib/site/navigation'

type Props = {
  menu: PublicBiznesNavigation['menu']
  /** Panels of the dropdowns, rendered on the server. */
  panels: { offer: ReactNode; industries: ReactNode }
}

const ITEM =
  'relative inline-flex min-h-11 items-center gap-1.5 whitespace-nowrap px-1 font-semibold text-ink after:absolute after:inset-x-1 after:bottom-1.5 after:h-[3px] after:rounded-full'

const pathOf = (href: string | null) =>
  href?.startsWith('/') && !href.startsWith('//') ? (href.split(/[?#]/)[0] ?? null) : null

function Chevron({ open }: { open: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="16"
      height="16"
      aria-hidden="true"
      className={cx('transition-transform', open && 'rotate-180')}
    >
      <path
        d="M6 9l6 6 6-6"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
      />
    </svg>
  )
}

/**
 * Desktop menu of the Biznes header (spec. §3.2) in the order set in the panel. Oferta ▾ and
 * Branże ▾ are disclosure buttons (`aria-expanded`), not ARIA menus: their panels hold plain
 * links reached with Tab. A panel closes on Esc (focus back on its button), a click outside,
 * focus moving out of it and a route change (links are `next/link`, so the layout stays). Without JavaScript the panels stay closed; their pages
 * are linked from the footer and the catalog.
 */
export function HeaderNav({ menu, panels }: Props) {
  const pathname = usePathname()
  const [open, setOpen] = useState<'offer' | 'industries' | null>(null)
  const navRef = useRef<HTMLElement>(null)
  const buttons = useRef<Partial<Record<'offer' | 'industries', HTMLButtonElement | null>>>({})
  const id = useId()

  // A link inside a panel changes the route: the panel must not stay open over the new page.
  const [shownPath, setShownPath] = useState(pathname)
  if (shownPath !== pathname) {
    setShownPath(pathname)
    setOpen(null)
  }

  useEffect(() => {
    if (!open) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return
      buttons.current[open]?.focus()
      setOpen(null)
    }
    const onPointer = (event: PointerEvent) => {
      if (!navRef.current?.contains(event.target as Node)) setOpen(null)
    }
    document.addEventListener('keydown', onKey)
    document.addEventListener('pointerdown', onPointer)
    return () => {
      document.removeEventListener('keydown', onKey)
      document.removeEventListener('pointerdown', onPointer)
    }
  }, [open])

  return (
    <nav ref={navRef} aria-label="Główna" className="hidden lg:block">
      <ul className="flex items-center gap-4 xl:gap-5">
        {menu.map((item, i) => {
          if (item.type === 'link') {
            const current = pathOf(item.href) === pathname
            return (
              <li key={i}>
                <Link
                  href={item.href ?? '/'}
                  aria-current={current ? 'page' : undefined}
                  className={cx(ITEM, current ? 'after:bg-accent' : 'hover:after:bg-border')}
                >
                  {item.partner && (
                    <span aria-hidden="true" className="size-1.5 rounded-full bg-ok" />
                  )}
                  {item.label}
                  {item.partner && <span className="sr-only">(partner)</span>}
                </Link>
              </li>
            )
          }
          const kind = item.type
          const expanded = open === kind
          const panelId = `${id}-${kind}`
          // The item is "current" on its pages: the catalog or an industry.
          const current = pathname.startsWith(kind === 'offer' ? '/oferta' : '/branze')
          return (
            <li
              key={i}
              onBlur={(event) => {
                // Focus moved to an element outside the button and its panel (Tab past the
                // last link): close it. A click on the panel's background leaves no target
                // (`relatedTarget` = null) and must not close it; clicks outside are handled
                // by `pointerdown` above.
                const next = event.relatedTarget
                if (expanded && next && !event.currentTarget.contains(next)) setOpen(null)
              }}
            >
              <button
                ref={(element) => {
                  buttons.current[kind] = element
                }}
                type="button"
                aria-expanded={expanded}
                aria-controls={panelId}
                onClick={() => setOpen(expanded ? null : kind)}
                className={cx(
                  ITEM,
                  'cursor-pointer',
                  expanded || current ? 'after:bg-accent' : 'hover:after:bg-border',
                )}
              >
                {item.label}
                <Chevron open={expanded} />
              </button>
              {/* Positioned against the sticky header, so the panel spans its full width. */}
              <div id={panelId} hidden={!expanded} className="absolute inset-x-0 top-full">
                {panels[kind]}
              </div>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
