'use client'

import { usePathname } from 'next/navigation'
import { type ReactNode, useEffect, useRef } from 'react'

import { ICON_BUTTON } from '@/components/ui/iconButton'

/**
 * Full-screen menu below 1024 px (spec. §3.3) on a native modal `<dialog>`: the browser keeps
 * focus inside, closes it on Esc and returns focus to the hamburger. It also closes when a
 * link inside is followed (route change), so it never stays open over the next page.
 */
export function MobileMenu({ children }: { children: ReactNode }) {
  const dialog = useRef<HTMLDialogElement>(null)
  const pathname = usePathname()

  useEffect(() => {
    dialog.current?.close()
  }, [pathname])

  return (
    <>
      <button
        type="button"
        aria-haspopup="dialog"
        onClick={() => dialog.current?.showModal()}
        className={ICON_BUTTON}
      >
        <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
          <path
            d="M4 7h16M4 12h16M4 17h16"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.9"
            strokeLinecap="round"
          />
        </svg>
        <span className="sr-only">Menu</span>
      </button>
      <dialog
        ref={dialog}
        aria-label="Menu"
        // A link to the current page does not change the route: close on any followed link.
        onClick={(event) => {
          if ((event.target as Element).closest('a')) dialog.current?.close()
        }}
        className="fixed inset-0 m-0 h-dvh max-h-none w-full max-w-none overflow-y-auto bg-surface p-0 text-ink backdrop:bg-surface-dark/60"
      >
        <div className="sticky top-0 z-10 flex min-h-[66px] items-center justify-between border-b border-border bg-surface px-4">
          <span className="font-display text-lg font-extrabold">Menu</span>
          <button type="button" onClick={() => dialog.current?.close()} className={ICON_BUTTON}>
            <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
              <path
                d="M6 6l12 12M18 6L6 18"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
            <span className="sr-only">Zamknij menu</span>
          </button>
        </div>
        <div className="px-4 pb-8 pt-2">{children}</div>
      </dialog>
    </>
  )
}
