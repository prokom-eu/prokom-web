'use client'

import { useEffect, useState } from 'react'

import { Icon } from '@/components/ui/Icon'
import { onProjectAdded, openProjectDrawer } from '@/lib/software/projectStore'

/** How long the toast stays (as on Biznes: about 2.5 s). */
const SHOW_MS = 2500

/**
 * „Dodano do Twojego projektu” after „+ Do projektu” on a card (spec. §3.1), with „Zobacz
 * projekt →” opening the list (`canOpen`: the header has the list, `headerRight.projectDrawer`).
 * A status region: announced without moving focus. On the phone above the bottom bar and the
 * project pill.
 */
export function ProjectToast({ canOpen }: { canOpen: boolean }) {
  const [added, setAdded] = useState<{ name: string; key: number } | null>(null)

  useEffect(
    () =>
      onProjectAdded(({ name }) => {
        // Under an open modal the toast would sit behind its backdrop; the ✓ switch shows it.
        if (document.querySelector('dialog[open]')) return
        setAdded({ name, key: Date.now() })
      }),
    [],
  )

  useEffect(() => {
    if (!added) return
    const timer = window.setTimeout(() => setAdded(null), SHOW_MS)
    return () => window.clearTimeout(timer)
  }, [added])

  return (
    <div
      role="status"
      className="pointer-events-none fixed inset-x-0 bottom-[calc(148px+env(safe-area-inset-bottom))] z-50 flex justify-center px-4 min-[1081px]:bottom-7"
    >
      {added && (
        <div
          key={added.key}
          className="pointer-events-auto flex max-w-full items-center gap-3.5 rounded-2xl bg-ink py-3 pl-4 pr-3 text-[0.95rem] text-surface shadow-raised"
        >
          <span
            aria-hidden="true"
            className="inline-flex size-[30px] shrink-0 items-center justify-center rounded-full bg-ok text-white"
          >
            <Icon name="check" strokeWidth={3} className="size-4" />
          </span>
          <span className="min-w-0">
            Dodano do Twojego projektu: <b className="font-extrabold">{added.name}</b>
          </span>
          {canOpen && (
            <button
              type="button"
              onClick={() => {
                setAdded(null)
                openProjectDrawer()
              }}
              className="min-h-11 shrink-0 rounded-xl bg-surface px-3 text-sm font-extrabold text-ink"
            >
              Zobacz projekt →
            </button>
          )}
        </div>
      )}
    </div>
  )
}
