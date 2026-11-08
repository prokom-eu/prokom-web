'use client'

import { useSearchParams } from 'next/navigation'
import { useEffect, useRef } from 'react'

import { track } from '@/lib/analytics/track'
import { registerFormAttachment } from '@/lib/shared/formAttachment'
import { projectActions, useProject } from '@/lib/software/projectStore'
import {
  careLevelFromParam,
  type ProjectSolution,
  summarizeProject,
} from '@/lib/software/projectSummary'

import { ProjectBox } from './ProjectBox'

/**
 * „Twój projekt” above the shared contact form (SWA5b, spec. §6.10, ZMIANY-v24 §9.3): the list
 * from `pk-project` with prices from `Solutions`. It joins the form as an attachment — its slugs
 * make the inquiry a `list`; after the send the list is emptied. `?projekt=1` shows the box even
 * when empty; `?poziom=` (price list „Zapytaj o opiekę X”) adds the care level to the message.
 */
export function ProjectPrefill({ solutions }: { solutions: readonly ProjectSolution[] }) {
  const project = useProject()
  const searchParams = useSearchParams()
  const summary = summarizeProject(project, solutions)
  const level = careLevelFromParam(searchParams.get('poziom') ?? undefined, solutions)
  // The attachment reads the newest values at sending, registered once.
  const latest = useRef({ summary, level })
  useEffect(() => {
    latest.current = { summary, level }
  })
  useEffect(
    () =>
      registerFormAttachment(
        () => (latest.current.level ? `Poziom opieki: ${latest.current.level}` : null),
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
