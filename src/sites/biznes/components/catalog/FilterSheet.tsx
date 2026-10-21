'use client'

import { useEffect, useId, useRef, type ReactNode, type RefObject } from 'react'

import { ICON_BUTTON } from '@/components/ui/iconButton'
import { plural } from '@/lib/plural'

type Props = {
  /** Active filters, shown on the button: „Filtry (3)”. */
  activeCount: number
  /** Positions the current filters show: „Pokaż 25 pozycji”. */
  resultCount: number
  /** The sheet's title: focus lands here when a focused control inside disappears. */
  titleRef: RefObject<HTMLSpanElement | null>
  children: ReactNode
}

/** From here the filters are the left column: an open sheet closes (e.g. a tablet turned). */
const DESKTOP = '(min-width: 1024px)'

/**
 * Filters on a phone (spec. §5.2, board `KatalogM`): a sheet from the bottom on a modal
 * `<dialog>` — the browser keeps focus inside, closes it on Esc and returns focus to the
 * button. Every choice applies at once (the URL changes behind it); „Pokaż N pozycji” closes it.
 * Rendered only below 1024 px; on a computer the filters are the left column.
 */
export function FilterSheet({ activeCount, resultCount, titleRef, children }: Props) {
  const dialog = useRef<HTMLDialogElement>(null)
  const titleId = useId()
  const close = () => dialog.current?.close()

  useEffect(() => {
    const desktop = window.matchMedia(DESKTOP)
    const onChange = () => {
      if (desktop.matches) dialog.current?.close()
    }
    desktop.addEventListener('change', onChange)
    return () => desktop.removeEventListener('change', onChange)
  }, [])

  return (
    <div className="lg:hidden">
      <button
        type="button"
        aria-haspopup="dialog"
        onClick={() => dialog.current?.showModal()}
        className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-ink px-4 text-sm font-extrabold text-surface"
      >
        <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
          <path
            d="M4 5h16l-6 8v6l-4-2v-4z"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinejoin="round"
          />
        </svg>
        Filtry{activeCount > 0 && ` (${activeCount})`}
      </button>
      <dialog
        ref={dialog}
        aria-labelledby={titleId}
        onClick={(event) => {
          // The backdrop: a pointer click on the dialog element above its box.
          const box = dialog.current?.getBoundingClientRect()
          if (event.target === dialog.current && box && event.clientY < box.top) close()
        }}
        className="fixed inset-x-0 bottom-0 top-auto m-0 max-h-[85dvh] w-full max-w-none rounded-t-[26px] bg-card p-0 text-ink shadow-2xl backdrop:bg-surface-dark/60 open:flex open:flex-col"
      >
        <div className="flex items-center justify-between gap-3 px-5 pb-2 pt-4">
          <span
            ref={titleRef}
            id={titleId}
            tabIndex={-1}
            className="font-display text-lg font-extrabold outline-none"
          >
            Filtry
          </span>
          <button type="button" onClick={close} className={ICON_BUTTON}>
            <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
              <path
                d="M6 6l12 12M18 6L6 18"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
            <span className="sr-only">Zamknij filtry</span>
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-5 pb-4">{children}</div>
        <div className="border-t border-border bg-card px-5 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3">
          <button
            type="button"
            onClick={close}
            className="inline-flex min-h-12 w-full items-center justify-center rounded-xl bg-accent-text px-5 font-extrabold text-accent-ink"
          >
            Pokaż {resultCount} {plural(resultCount, ['pozycję', 'pozycje', 'pozycji'])}
          </button>
        </div>
      </dialog>
    </div>
  )
}
