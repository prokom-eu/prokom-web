'use client'

import { useSearchParams } from 'next/navigation'
import { useEffect, useRef } from 'react'

import { track } from '@/lib/analytics/track'
import { registerFormAttachment } from '@/lib/shared/formAttachment'
import { projectActions, useProject } from '@/lib/software/projectStore'
import { type ProjectSolution, summarizeProject } from '@/lib/software/projectSummary'

import { ProjectBox } from './ProjectBox'

/**
 * „Twój projekt” above the shared contact form (SWA5b, spec. §6.10, ZMIANY-v24 §9.3): the list
 * from `pk-project` with prices from `Solutions`. It joins the form as an attachment — its slugs
 * make the inquiry a `list`; after the send the list is emptied. `?projekt=1` shows the box even
 * when empty (the care level of the price list comes as `?temat=` + `?fraza=` of the shared form).
 */
export function ProjectPrefill({ solutions }: { solutions: readonly ProjectSolution[] }) {
  const project = useProject()
  const searchParams = useSearchParams()
  const summary = summarizeProject(project, solutions)
  // The attachment reads the newest list at sending, registered once.
  const latest = useRef({ summary })
  useEffect(() => {
    latest.current = { summary }
  })
  useEffect(
    () =>
      registerFormAttachment(
        // No text: the list goes as the inquiry's items (the server writes its message).
        () => null,
        {
          items: () => latest.current.summary.slugs,
          onSent: () => {
            const { summary: sent } = latest.current
            if (sent.slugs.length > 0) {
              track('projekt_wyslij', { liczba: sent.slugs.length })
              projectActions.clear()
            }
          },
        },
      ),
    [],
  )
  const asked = searchParams.get('projekt') === '1'
  if (summary.rows.length === 0 && !asked) return null
  return <ProjectBox summary={summary} />
}
