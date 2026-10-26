'use client'

import { useEffect, useRef, useState } from 'react'

import { Icon } from '@/components/ui/Icon'
import { plural } from '@/lib/plural'
import type { SoftwareNavigation } from '@/lib/software/navigation'
import { onProjectOpen, useProject } from '@/lib/software/projectStore'

import { BottomSheet } from './BottomSheet'
import { focusProjectFallback, isDesktop } from './layer'
import { ProjectList } from './ProjectList'

type Props = {
  /** „Twój projekt · {n} · Zobacz →” (`navigation.projectPill`). */
  pill: string
  texts: SoftwareNavigation['projectDrawer']
}

/** The pill's label around `{n}`; the part after the last „·” is the accent („Zobacz →”). */
function pillParts(pill: string) {
  const [before = '', after = ''] = pill.split('{n}')
  const cut = after.lastIndexOf('·')
  return {
    before: before.replace(/[\s·]+$/, ''),
    middle: cut === -1 ? '' : after.slice(0, cut).replace(/^[\s·]+|[\s·]+$/g, ''),
    accent: (cut === -1 ? after : after.slice(cut + 1)).trim(),
  }
}

/**
 * „Twój projekt” on the phone (spec. §3.2, `stany/81a`, `81`): an inverted pill above the
 * bottom bar, only while the list has items, opening the sheet with the same list as the
 * desktop panel (`ProjectList`). The toast's „Zobacz projekt” opens the sheet below 1081 px.
 * Emptied, the sheet stays with the empty text; closing it then focuses „Wycena”.
 */
export function ProjectPill({ pill, texts }: Props) {
  const project = useProject()
  const [open, setOpen] = useState(false)
  const headingRef = useRef<HTMLHeadingElement>(null)
  const hasItems = project.length > 0

  useEffect(
    () =>
      onProjectOpen(() => {
        if (!isDesktop()) setOpen(true)
      }),
    [],
  )

  const close = () => {
    if (!open) return
    setOpen(false)
    // The dialog gives focus back to the pill — gone with an empty list. Next frame: from ×
    // the dialog is still modal here (the page behind it inert), it closes in an effect.
    if (!hasItems) requestAnimationFrame(focusProjectFallback)
  }

  const { before, middle, accent } = pillParts(pill)
  return (
    <>
      {hasItems && (
        <div className="pointer-events-none fixed inset-x-0 bottom-[calc(88px+env(safe-area-inset-bottom))] z-40 flex justify-center px-4 min-[1081px]:hidden">
          <button
            type="button"
            aria-haspopup="dialog"
            onClick={() => setOpen(true)}
            className="pointer-events-auto inline-flex min-h-12 max-w-full items-center gap-2.5 rounded-full bg-ink py-1.5 pl-1.5 pr-5 font-bold text-surface shadow-raised"
          >
            <span
              aria-hidden="true"
              className="inline-flex size-9 shrink-0 items-center justify-center rounded-full bg-button text-accent-ink"
            >
              <Icon name="brief" className="size-[18px]" />
            </span>
            <span>{before}</span>
            <span className="inline-flex min-w-6 items-center justify-center rounded-full bg-surface px-1.5 py-0.5 text-sm font-extrabold text-ink">
              {project.length}
              <span className="sr-only">
                {' '}
                {plural(project.length, ['pozycja', 'pozycje', 'pozycji'])}
              </span>
            </span>
            {middle && <span>{middle}</span>}
            {accent && <span className="text-pill-accent">{accent}</span>}
          </button>
        </div>
      )}
      <BottomSheet open={open} onClose={close} title={texts.title} headingRef={headingRef}>
        <ProjectList texts={texts} headingRef={headingRef} onSend={() => setOpen(false)} />
      </BottomSheet>
    </>
  )
}
