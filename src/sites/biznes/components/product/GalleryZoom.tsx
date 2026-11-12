'use client'

import { useEffect, useRef } from 'react'

import { MediaImage } from '@/components/MediaImage'
import type { PublicImage } from '@/lib/media/public'

const ARROWS = [
  [-1, 'Poprzednie zdjęcie', 'M15 6l-6 6 6 6'],
  [1, 'Następne zdjęcie', 'M9 6l6 6-6 6'],
] as const

/**
 * The product photo enlarged (PRODUKCJA-BIZNES-1211 §1): a modal `<dialog>` — the browser keeps
 * the focus inside and Esc closes it — with arrows (buttons and ←/→), the „2 / 5” counter and the
 * photo on the white plate in both themes. Opened by the gallery; closing gives the focus back to
 * the button that opened it (native `showModal`).
 */
export function GalleryZoom({
  name,
  images,
  active,
  open,
  onMove,
  onClose,
}: {
  name: string
  images: PublicImage[]
  active: number
  open: boolean
  onMove: (delta: number) => void
  onClose: () => void
}) {
  const dialog = useRef<HTMLDialogElement>(null)
  useEffect(() => {
    const element = dialog.current
    if (!element) return
    if (open && !element.open) element.showModal()
    if (!open && element.open) element.close()
  }, [open])
  const image = images[active]
  const count = images.length
  return (
    <dialog
      ref={dialog}
      aria-label={`${name} — zdjęcie ${active + 1} z ${count}`}
      data-motion="dialog"
      data-gallery-zoom=""
      onClose={onClose}
      onKeyDown={(event) => {
        if (event.key === 'ArrowRight') onMove(1)
        if (event.key === 'ArrowLeft') onMove(-1)
      }}
      onClick={(event) => {
        // A click on the backdrop (the dialog itself, outside its box) closes it.
        if (event.target === event.currentTarget) onClose()
      }}
      className="m-auto h-[min(92vh,900px)] w-[min(94vw,1200px)] max-w-none overflow-hidden rounded-[28px] bg-plate p-0 text-surface-dark backdrop:bg-surface-dark/80 max-md:h-[100dvh] max-md:w-screen max-md:rounded-none"
    >
      {open && image && (
        <div className="relative flex h-full flex-col">
          <div className="flex items-center justify-between gap-3 px-5 pt-4 pb-2">
            <p className="font-extrabold">
              {name}{' '}
              {count > 1 && (
                <span aria-live="polite" className="ml-2 text-sm font-bold opacity-70">
                  {active + 1} / {count}
                </span>
              )}
            </p>
            <button
              type="button"
              onClick={onClose}
              aria-label="Zamknij powiększenie"
              className="flex size-11 items-center justify-center rounded-full bg-surface-dark/10 hover:bg-surface-dark/20"
              autoFocus
            >
              <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
                <path
                  d="M6 6l12 12 M18 6L6 18"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.4"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          </div>
          <div className="relative flex min-h-0 flex-1 items-center justify-center px-14 pb-6 max-md:px-4">
            <MediaImage
              key={active}
              image={image}
              sizes="(min-width: 1200px) 1100px, 94vw"
              className="max-h-full w-auto max-w-full object-contain"
            />
          </div>
          {count > 1 &&
            ARROWS.map(([delta, label, path]) => (
              <button
                key={label}
                type="button"
                onClick={() => onMove(delta)}
                aria-label={label}
                className={`absolute top-1/2 flex size-12 -translate-y-1/2 items-center justify-center rounded-full bg-white text-surface-dark shadow-[0_8px_20px_-10px_var(--plate-shadow),inset_0_0_0_1px_var(--plate-shadow)] ${delta < 0 ? 'left-3' : 'right-3'}`}
              >
                <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
                  <path
                    d={path}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            ))}
        </div>
      )}
    </dialog>
  )
}
