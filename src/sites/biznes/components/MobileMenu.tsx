'use client'

import { type ReactNode, useState } from 'react'

import { BottomSheet } from '@/components/BottomSheet'
import { ICON_BUTTON } from '@/components/ui/iconButton'

/** Where `BiznesHeader` shows the desktop navigation instead (spec. §3.2, v20). */
const DESKTOP_QUERY = '(min-width: 1080px)'

/**
 * Menu below 1080 px as a sheet from the bottom (MOBILE-APLIKACJA §1, board `App-Menu`) on the
 * shared `BottomSheet`: a native modal `<dialog>` (focus stays inside, Esc, focus back to the
 * hamburger), closed by the backdrop, ×, a pull down, the browser's „back”, a followed link and
 * when the desktop navigation takes over (a rotated tablet).
 */
export function MobileMenu({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false)
  return (
    <>
      <button
        type="button"
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => setOpen(true)}
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
      <BottomSheet
        open={open}
        onClose={() => setOpen(false)}
        title="Menu"
        desktopQuery={DESKTOP_QUERY}
        dragToClose
        closeOnBack
      >
        {children}
      </BottomSheet>
    </>
  )
}
