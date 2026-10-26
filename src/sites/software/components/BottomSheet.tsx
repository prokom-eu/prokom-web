'use client'

import { usePathname } from 'next/navigation'
import { type ReactNode, type RefObject, useEffect, useEffectEvent, useRef } from 'react'

import { Icon } from '@/components/ui/Icon'

import { DESKTOP_QUERY } from './layer'

type Props = {
  open: boolean
  onClose: () => void
  title: string
  /** `tabIndex={-1}` heading, for contents that move focus to it (`ProjectList`). */
  headingRef?: RefObject<HTMLHeadingElement | null>
  children: ReactNode
}

/**
 * Sheet from the bottom of the Software phone layer (spec. §3.2, §8.6; `stany/80`, `81`) on a
 * native modal `<dialog>` — the browser keeps focus inside, closes it on Esc and gives focus back
 * to the opener (the B3b pattern). Also closes on a tap on the backdrop, a route change and when
 * the desktop header takes over (an open modal would leave a rotated tablet inert). Handle,
 * title and ×; at most 92% of the screen, scrolling inside; safe area at the bottom.
 */
export function BottomSheet({ open, onClose, title, headingRef, children }: Props) {
  const dialog = useRef<HTMLDialogElement>(null)
  const pathname = usePathname()
  // React 19.2: the latest `onClose` without re-running the effects below.
  // Only an open sheet is closed: on mount or while closed nothing must happen (the parent's
  // `onClose` may move focus).
  const close = useEffectEvent(() => {
    if (dialog.current?.open) onClose()
  })

  useEffect(() => {
    const element = dialog.current
    if (!element) return
    if (open && !element.open) element.showModal()
    if (!open && element.open) element.close()
  }, [open])

  // A followed link (route change) must not leave the sheet over the next page.
  useEffect(() => {
    close()
  }, [pathname])

  useEffect(() => {
    const desktop = window.matchMedia(DESKTOP_QUERY)
    const onChange = () => {
      if (desktop.matches) close()
    }
    desktop.addEventListener('change', onChange)
    return () => desktop.removeEventListener('change', onChange)
  }, [])

  return (
    <dialog
      ref={dialog}
      aria-label={title}
      // Esc, `close()` from the effect or a form: keep the parent's state in step.
      onClose={onClose}
      onClick={(event) => {
        // The backdrop: a click on the dialog element above its box (not its scrollbar, not a
        // text selection ending outside — those target the dialog too; the B3b `FilterSheet`).
        const box = event.currentTarget.getBoundingClientRect()
        if (event.target === event.currentTarget && event.clientY < box.top) return onClose()
        // A link to the current page changes no route: close on a followed link too — not on
        // „open in a new tab” (modifier or middle button), which leaves this page as it is.
        const opensHere =
          event.button === 0 && !event.ctrlKey && !event.metaKey && !event.shiftKey && !event.altKey
        if (opensHere && (event.target as Element).closest('a')) onClose()
      }}
      className="fixed inset-x-0 bottom-0 top-auto m-0 max-h-[92dvh] w-full max-w-none overflow-y-auto overscroll-contain rounded-t-[28px] bg-surface p-0 text-ink shadow-raised backdrop:bg-surface-dark/60"
    >
      <div className="px-4 pb-[calc(1.5rem+env(safe-area-inset-bottom))] pt-2.5">
        <span aria-hidden="true" className="mx-auto block h-1.5 w-11 rounded-full bg-border" />
        <div className="mt-3 flex items-center justify-between gap-3">
          <h2
            ref={headingRef}
            tabIndex={-1}
            className="font-display text-[28px] font-extrabold leading-tight outline-none"
          >
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex size-11 shrink-0 items-center justify-center rounded-xl bg-chip text-ink"
          >
            <Icon name="x" strokeWidth={2.4} className="size-5" />
            <span className="sr-only">Zamknij</span>
          </button>
        </div>
        {children}
      </div>
    </dialog>
  )
}
