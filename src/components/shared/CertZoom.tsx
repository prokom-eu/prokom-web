'use client'

import Image from 'next/image'
import { type ReactNode, useEffect, useRef, useState } from 'react'

import type { Certificate } from '@/lib/partners/certificates'

/** The attribute of a button inside `CertZoom` that opens a certificate: `data-cert={item.id}`. */
const CERT_ATTR = 'data-cert'

/**
 * The enlarged certificate (boss consent 23.11.2026): wraps server-rendered thumbnails — any
 * button with `data-cert="<key>"` inside opens that document in a modal `<dialog>`. The browser
 * keeps the focus inside, Esc or a click beside the document closes it, and the focus goes back
 * to the button that opened it. Styles `.cdlg` in `wspolne.css`, on each line's tokens; the
 * caption repeats the years, so the document is never read as current.
 */
export function CertZoom({
  items,
  children,
  className,
}: {
  items: readonly Certificate[]
  children: ReactNode
  className?: string
}) {
  const dialog = useRef<HTMLDialogElement>(null)
  const [open, setOpen] = useState<Certificate | null>(null)

  useEffect(() => {
    const element = dialog.current
    if (open && element && !element.open) element.showModal()
  }, [open])

  return (
    <div
      className={className}
      onClick={(event) => {
        const button = (event.target as HTMLElement).closest<HTMLElement>(`[${CERT_ATTR}]`)
        const item = button && items.find((cert) => cert.id === button.getAttribute(CERT_ATTR))
        if (item) setOpen(item)
      }}
    >
      {children}
      <dialog
        ref={dialog}
        className="cdlg"
        aria-label={open ? `${open.title}, ${open.period}` : 'Certyfikat'}
        onClick={(event) => {
          if (event.target === dialog.current) dialog.current?.close()
        }}
        onClose={() => setOpen(null)}
      >
        {open && (
          <figure className="cdlg__fig">
            <span className="cdlg__plate">
              <Image
                src={open.image.src}
                alt={`${open.title} — dokument z lat ${open.period}`}
                width={open.image.width}
                height={open.image.height}
                sizes="(min-width: 1100px) 1000px, 94vw"
              />
            </span>
            <figcaption className="cdlg__cap">
              <b>{open.title}</b>
              <span>
                {open.scope} · {open.period}
                {open.kind === 'status' && ' · dokument archiwalny'}
              </span>
            </figcaption>
          </figure>
        )}
        <form method="dialog">
          <button type="submit" className="cdlg__close" aria-label="Zamknij podgląd">
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.4"
              strokeLinecap="round"
              aria-hidden="true"
            >
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </form>
      </dialog>
    </div>
  )
}
