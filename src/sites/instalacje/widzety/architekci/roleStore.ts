'use client'

import { useSyncExternalStore } from 'react'

/*
 * The role chosen in „Dla kogo jest ta strona” (`#dla-ciebie`) preselects „Kim jesteś” in the
 * form `#wyslij` (spec §4: CTA to `#wyslij` with the role chosen). A tiny store: the tabs and the
 * form sit in different sections. Index into `architekci.form.roles`.
 */
const ROLE_OF_AUDIENCE: Record<string, number> = { arch: 0, wn: 1, gw: 2, dev: 3 }

let role = 0
const listeners = new Set<() => void>()

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

/** The audience tab chose a role (its key in `architekci.audience`). */
export function chooseAudience(key: string) {
  const next = ROLE_OF_AUDIENCE[key]
  if (next === undefined || next === role) return
  role = next
  for (const l of listeners) l()
}

export function useChosenRole(): number {
  return useSyncExternalStore(
    subscribe,
    () => role,
    () => 0,
  )
}
