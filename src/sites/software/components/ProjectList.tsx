'use client'

import Link from 'next/link'
import { type RefObject, useEffect, useRef } from 'react'

import { Icon } from '@/components/ui/Icon'
import type { SoftwareNavigation } from '@/lib/software/navigation'
import { PROJECT_SEND_HREF } from '@/lib/software/project'
import { projectActions, useProject } from '@/lib/software/projectStore'

type Props = {
  texts: SoftwareNavigation['projectDrawer']
  /** Heading of the surrounding panel or sheet (`tabIndex={-1}`): focus lands there when the
      control it was on disappears. */
  headingRef: RefObject<HTMLHeadingElement | null>
  /** „Wyślij do wyceny” leaves the page: the panel or sheet closes. */
  onSend: () => void
}

/** The inquiry form takes the list from the browser (`?projekt=1`) — straight to the form
    (spec. §3.1, v21). */

/** Focus to restore after the list changed under it: a removed row or a cleared list. */
type PendingFocus = { row: number } | 'heading'

/**
 * Contents of „Twój projekt” — the desktop panel and the phone sheet (spec. §3.1–3.2,
 * `stany/02`, `81`): the solutions with „Usuń”, „Wyślij do wyceny” and „Wyczyść
 * listę”, or the empty text. Focus never falls to the page: after „Usuń” it moves to the next
 * row's „Usuń” (or the heading), after „Wyczyść listę” to the heading.
 */
export function ProjectList({ texts, headingRef, onSend }: Props) {
  const project = useProject()
  const listRef = useRef<HTMLUListElement>(null)
  const pendingFocus = useRef<PendingFocus | null>(null)

  useEffect(() => {
    const pending = pendingFocus.current
    if (!pending) return
    pendingFocus.current = null
    const rows = listRef.current?.querySelectorAll<HTMLButtonElement>('button') ?? []
    const target = pending === 'heading' ? null : rows[Math.min(pending.row, rows.length - 1)]
    ;(target ?? headingRef.current)?.focus()
  }, [project, headingRef])

  if (project.length === 0) return <p className="mt-3 text-ink-2">{texts.empty}</p>

  return (
    <>
      <ul ref={listRef} className="mt-3 space-y-2">
        {project.map((item, row) => (
          <li
            key={item.id}
            className="flex items-center gap-3 rounded-xl bg-surface-2 py-1 pl-3 pr-1"
          >
            <span
              aria-hidden="true"
              className="inline-flex size-[22px] shrink-0 items-center justify-center rounded-full bg-ok text-white"
            >
              <Icon name="check" strokeWidth={3} className="size-3" />
            </span>
            <span className="min-w-0 flex-1 font-bold">{item.name}</span>
            <button
              type="button"
              onClick={() => {
                pendingFocus.current = { row }
                projectActions.remove(item.id)
              }}
              className="inline-flex size-11 shrink-0 items-center justify-center rounded-lg text-ink-2 hover:text-ink"
            >
              <Icon name="x" strokeWidth={2.2} className="size-4" />
              <span className="sr-only">Usuń: {item.name}</span>
            </button>
          </li>
        ))}
      </ul>
      <Link
        href={PROJECT_SEND_HREF}
        onClick={onSend}
        className="mt-4 flex min-h-[52px] items-center justify-center rounded-xl bg-button px-5 font-bold text-accent-ink"
      >
        {texts.send}
      </Link>
      <button
        type="button"
        onClick={() => {
          pendingFocus.current = 'heading'
          projectActions.clear()
        }}
        className="mx-auto mt-2 flex min-h-11 items-center px-3 text-sm font-bold text-ink-2 underline underline-offset-4 hover:text-ink"
      >
        {texts.clear}
      </button>
    </>
  )
}
