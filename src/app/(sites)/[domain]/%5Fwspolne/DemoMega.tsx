'use client'

import { useEffect, useId, useRef, useState } from 'react'

import { CAPSULE } from '@/components/shared/capsule'

/**
 * A stand-in mega menu for the preview page: the lines keep their own (D3 plugs them into the
 * `megaFor` slot). It shows what the capsule gives a line — trigger and panel classes, position
 * under the capsule — and the accessibility each line keeps: `aria-expanded`, `aria-controls`,
 * Esc closes and returns focus to the trigger.
 */
export function DemoMega({
  label,
  initiallyOpen = false,
}: {
  label: string
  initiallyOpen?: boolean
}) {
  const [open, setOpen] = useState(initiallyOpen)
  const id = useId()
  const trigger = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!open) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return
      setOpen(false)
      trigger.current?.focus()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open])

  return (
    <>
      <button
        ref={trigger}
        type="button"
        className={CAPSULE.link}
        aria-expanded={open}
        aria-controls={id}
        onClick={() => setOpen((value) => !value)}
      >
        {label}
        <svg
          viewBox="0 0 24 24"
          width="13"
          height="13"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>
      <div id={id} className={CAPSULE.mega} hidden={!open} data-demo-mega>
        <div className="grid gap-2 p-6 text-sm">
          <p className="font-extrabold">Mega menu linii — „{label}”</p>
          <p className="text-nav-ink-2">
            Treść i logika zostają w komponencie linii; kapsuła daje miejsce, szerokość i promień.
          </p>
          <a href="#tresc" className="font-bold text-nav-active-ink underline">
            Przykładowy odnośnik
          </a>
        </div>
      </div>
    </>
  )
}
