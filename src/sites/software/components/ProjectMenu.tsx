'use client'

import { usePathname } from 'next/navigation'
import { useEffect, useId, useRef, useState } from 'react'

import { Icon } from '@/components/ui/Icon'
import { plural } from '@/lib/plural'
import type { SoftwareNavigation } from '@/lib/software/navigation'
import { onProjectOpen, useProject } from '@/lib/software/projectStore'

import { focusProjectFallback, isDesktop } from './layer'
import { ProjectList } from './ProjectList'

type Props = { texts: SoftwareNavigation['projectDrawer'] }

/** After closing: back on the button — or, with the button gone (empty list), next to it. */
function focusAfterClose(button: HTMLButtonElement | null, hasItems: boolean) {
  if (hasItems) button?.focus()
  else focusProjectFallback()
}

/**
 * „Twój projekt ▾” of the desktop header (spec. §3.1, `stany/02-twoj-projekt.jpg`): shown only
 * while the list has items. A disclosure button with a panel below it — Esc (focus back), ×, a
 * click outside, focus leaving it and a route change close it; the toast's „Zobacz projekt”
 * opens it on the desktop (the phone opens its sheet). The contents and their focus rules are
 * `ProjectList`; emptied, the panel stays with the empty text, and closing it then moves focus
 * to the element marked `data-project-fallback` („Bezpłatna wycena”).
 */
export function ProjectMenu({ texts }: Props) {
  const project = useProject()
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const headingRef = useRef<HTMLHeadingElement>(null)
  const panelId = useId()

  // A link in the panel („Wyślij…”) or next to it changes the route: close over the new page.
  const [shownPath, setShownPath] = useState(pathname)
  if (shownPath !== pathname) {
    setShownPath(pathname)
    setOpen(false)
  }

  const hasItems = project.length > 0
  const close = () => {
    setOpen(false)
    focusAfterClose(buttonRef.current, hasItems)
  }

  useEffect(
    () =>
      onProjectOpen(() => {
        if (!isDesktop()) return
        setOpen(true)
        buttonRef.current?.focus()
      }),
    [],
  )

  useEffect(() => {
    if (!open) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return
      setOpen(false)
      focusAfterClose(buttonRef.current, hasItems)
    }
    const onPointer = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false)
    }
    document.addEventListener('keydown', onKey)
    document.addEventListener('pointerdown', onPointer)
    return () => {
      document.removeEventListener('keydown', onKey)
      document.removeEventListener('pointerdown', onPointer)
    }
  }, [open, hasItems])

  if (project.length === 0 && !open) return null

  return (
    <div
      ref={rootRef}
      className="relative"
      onBlur={(event) => {
        // Tab out of the panel closes it; a removed control leaves no `relatedTarget`.
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
        title={texts.title}
        className="inline-flex min-h-11 items-center gap-1.5 whitespace-nowrap rounded-xl border border-accent-line bg-accent-soft px-2.5 text-[15px] font-bold text-ink min-[1360px]:gap-2 min-[1360px]:px-3.5"
      >
        <Icon name="brief" className="size-[18px]" />
        {/* The board's label does not fit the row with Manrope (wider than the board's font)
            even at 1440 px: icon and count stay, the name is for screen readers and the tooltip. */}
        <span className="sr-only">{texts.title}</span>
        <span className="inline-flex min-w-6 items-center justify-center rounded-full bg-button px-1.5 py-0.5 text-xs font-extrabold text-accent-ink">
          {project.length}
          <span className="sr-only">
            {' '}
            {plural(project.length, ['pozycja', 'pozycje', 'pozycji'])}
          </span>
        </span>
      </button>

      <div
        id={panelId}
        hidden={!open}
        className="absolute right-0 top-full z-50 mt-2.5 w-[390px] rounded-3xl border border-border bg-card p-5 shadow-raised"
      >
        <div className="flex items-center justify-between gap-3">
          <h2
            ref={headingRef}
            tabIndex={-1}
            className="font-display text-xl font-extrabold outline-none"
          >
            {texts.title}
          </h2>
          <button
            type="button"
            onClick={close}
            className="inline-flex size-11 items-center justify-center rounded-xl bg-chip text-ink"
          >
            <Icon name="x" strokeWidth={2.4} className="size-4" />
            <span className="sr-only">Zamknij</span>
          </button>
        </div>

        <ProjectList texts={texts} headingRef={headingRef} onSend={() => setOpen(false)} />
      </div>
    </div>
  )
}
