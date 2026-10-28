'use client'

import { usePathname } from 'next/navigation'
import {
  type PointerEvent,
  type ReactNode,
  type RefObject,
  useEffect,
  useEffectEvent,
  useRef,
} from 'react'

import { Icon } from '@/components/ui/Icon'

import { shouldCloseOnDrag } from './sheetDrag'

/** Size and position of the panel when the line gives none: full width, from the bottom. */
const DEFAULT_PANEL = 'inset-x-0 bottom-0 top-auto max-h-[92dvh] w-full max-w-none rounded-t-[28px]'
/** Dimmed page behind the sheet when the line gives none. */
const DEFAULT_BACKDROP = 'backdrop:bg-surface-dark/60'
/** Movement (px) before a press on the sheet's top becomes a drag (a tap stays a tap). */
const DRAG_START = 6

/** Back to the sheet's own place, without the inline styles of a drag. */
function resetSheet(element: HTMLDialogElement) {
  element.style.transition = ''
  element.style.transform = ''
}

type Props = {
  open: boolean
  onClose: () => void
  /** Accessible name of the dialog; also the visible heading unless `header` replaces it. */
  title: string
  /** Media query of the line's desktop layout: an open sheet closes when it starts to match. */
  desktopQuery: string
  /** `tabIndex={-1}` heading, for contents that move focus to it (`ProjectList`). */
  headingRef?: RefObject<HTMLHeadingElement | null>
  /** Replaces the heading row (title and ×), e.g. tabs; it must bring its own close button. */
  header?: ReactNode
  /** Replaces the default size and position classes of the panel (`DEFAULT_PANEL`). */
  panelClassName?: string
  /** Replaces the default backdrop classes (`DEFAULT_BACKDROP`); use `backdrop:` utilities. */
  backdropClassName?: string
  /** Stays at the bottom of the panel while the content scrolls (e.g. the main action). */
  footer?: ReactNode
  /** Pulling the top of the sheet (handle and header) down closes it. */
  dragToClose?: boolean
  children: ReactNode
}

/**
 * Sheet from the bottom of the phone layer (Software spec. §3.2, §8.6; Instalacje
 * MOBILE-APLIKACJA §4; ADR-I004) on a native modal `<dialog>` — the browser keeps focus inside,
 * closes it on Esc and gives focus back to the opener (the B3b pattern). Also closes on a tap on
 * the backdrop, a route change and when the desktop header takes over (an open modal would leave
 * a rotated tablet inert). Handle, title and ×; scrolling inside; safe area at the bottom.
 */
export function BottomSheet({
  open,
  onClose,
  title,
  desktopQuery,
  headingRef,
  header,
  panelClassName,
  backdropClassName,
  footer,
  dragToClose = false,
  children,
}: Props) {
  const dialog = useRef<HTMLDialogElement>(null)
  const drag = useRef<{ y: number; time: number; dy: number; active: boolean } | null>(null)
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
    // A sheet closed by a pull stays where the finger left it until it is hidden; the next
    // opening starts from its own place again.
    if (!open) resetSheet(element)
  }, [open])

  // A followed link (route change) must not leave the sheet over the next page.
  useEffect(() => {
    close()
  }, [pathname])

  useEffect(() => {
    const desktop = window.matchMedia(desktopQuery)
    const onChange = () => {
      if (desktop.matches) close()
    }
    desktop.addEventListener('change', onChange)
    return () => desktop.removeEventListener('change', onChange)
  }, [desktopQuery])

  const moveSheet = (dy: number, animate: boolean) => {
    const element = dialog.current
    if (!element) return
    element.style.transition = animate ? 'transform .2s ease' : 'none'
    element.style.transform = dy > 0 ? `translateY(${dy}px)` : ''
  }

  const dragHandlers = dragToClose
    ? {
        onPointerDown: (event: PointerEvent<HTMLDivElement>) => {
          if (event.pointerType === 'mouse' && event.button !== 0) return
          drag.current = { y: event.clientY, time: event.timeStamp, dy: 0, active: false }
        },
        onPointerMove: (event: PointerEvent<HTMLDivElement>) => {
          const state = drag.current
          if (!state) return
          // A mouse released outside the sheet's top sent no `pointerup` here: drop the drag
          // instead of letting a plain hover move the sheet.
          if (event.buttons === 0) {
            drag.current = null
            if (state.active) moveSheet(0, true)
            return
          }
          state.dy = event.clientY - state.y
          if (!state.active && state.dy > DRAG_START) {
            state.active = true
            event.currentTarget.setPointerCapture(event.pointerId)
          }
          if (state.active) moveSheet(state.dy, false)
        },
        onPointerUp: (event: PointerEvent<HTMLDivElement>) => {
          const state = drag.current
          drag.current = null
          if (!state?.active) return
          const velocity = state.dy / Math.max(1, event.timeStamp - state.time)
          // Closing: hide it from where it is (no bounce back first); the `open` effect resets it.
          if (shouldCloseOnDrag(state.dy, velocity)) onClose()
          else moveSheet(0, true)
        },
        onPointerCancel: () => {
          drag.current = null
          moveSheet(0, true)
        },
      }
    : {}

  return (
    <dialog
      ref={dialog}
      aria-label={title}
      // Esc, `close()` from the effect or a form: keep the parent's state in step.
      onClose={onClose}
      onClick={(event) => {
        // The backdrop: a click on the dialog element outside its box (not its scrollbar, not a
        // text selection ending outside — those target the dialog too; the B3b `FilterSheet`).
        const box = event.currentTarget.getBoundingClientRect()
        const outside =
          event.clientY < box.top ||
          event.clientY > box.bottom ||
          event.clientX < box.left ||
          event.clientX > box.right
        if (event.target === event.currentTarget && outside) return onClose()
        // A link to the current page changes no route: close on a followed link too — not on
        // „open in a new tab” (modifier or middle button), which leaves this page as it is.
        const opensHere =
          event.button === 0 && !event.ctrlKey && !event.metaKey && !event.shiftKey && !event.altKey
        if (opensHere && (event.target as Element).closest('a')) onClose()
      }}
      className={`fixed m-0 overflow-y-auto overscroll-contain bg-surface p-0 text-ink shadow-raised ${backdropClassName ?? DEFAULT_BACKDROP} ${panelClassName ?? DEFAULT_PANEL}`}
    >
      {/* With a footer the safe area moves to the footer, the last thing on the screen. */}
      <div
        className={
          footer ? 'px-4 pb-4 pt-2.5' : 'px-4 pb-[calc(1.5rem+env(safe-area-inset-bottom))] pt-2.5'
        }
      >
        <div {...dragHandlers} className={dragToClose ? 'touch-none' : undefined}>
          <span aria-hidden="true" className="mx-auto block h-1.5 w-11 rounded-full bg-border" />
          {header ?? (
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
          )}
        </div>
        {children}
      </div>
      {footer && (
        <div className="sticky bottom-0 border-t border-border bg-surface px-4 pb-[calc(0.75rem+env(safe-area-inset-bottom))] pt-3">
          {footer}
        </div>
      )}
    </dialog>
  )
}
