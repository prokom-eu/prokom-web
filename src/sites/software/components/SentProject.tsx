'use client'

import { useSyncExternalStore } from 'react'

import { parseSent, PROJECT_SENT_KEY } from '@/lib/software/project'

const noSubscribe = () => () => {}

function readSent(): string | null {
  try {
    return sessionStorage.getItem(PROJECT_SENT_KEY)
  } catch {
    return null
  }
}

/**
 * „Wysłane razem z: …” on `/dziekujemy` after „Twój projekt” went with the inquiry (spec.
 * §6.10): the names the contact form left in this tab for this inquiry number. Nothing on the
 * server render.
 */
export function SentProject({ number }: { number: string | null }) {
  const raw = useSyncExternalStore(noSubscribe, readSent, () => null)
  const names = parseSent(raw, number)
  if (names.length === 0) return null
  return (
    <p className="mt-3 text-ink-2">
      Wysłane razem z: <strong className="text-ink">{names.join(', ')}</strong>
    </p>
  )
}
