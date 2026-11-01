'use client'

import { useSyncExternalStore } from 'react'

/**
 * State the GoPOS sections share (K32 §3): the venue tab, the package and the step of the order
 * flow. A venue sets the package, „Dodaj GoHub do pakietu” and the configurator change it, the
 * flow strip and the hero stage light up the same device. `picked: null` = nothing clicked yet:
 * each section shows its starting package (`initial`), so the server render matches.
 */
type GoposState = {
  venue: string | null
  picked: ReadonlySet<string> | null
  step: number | null
}

const INITIAL: GoposState = { venue: null, picked: null, step: null }

let state = INITIAL
const listeners = new Set<() => void>()

function set(next: Partial<GoposState>) {
  state = { ...state, ...next }
  for (const listener of listeners) listener()
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function useGopos(): GoposState {
  return useSyncExternalStore(
    subscribe,
    () => state,
    () => INITIAL,
  )
}

/** The package now: the clicked one, or the section's starting package. */
export const pickedOr = (s: GoposState, initial: readonly string[]): ReadonlySet<string> =>
  s.picked ?? new Set(initial)

export const goposActions = {
  pickVenue: (venue: string, modules: readonly string[]) =>
    set({ venue, picked: new Set(modules), step: null }),
  setPicked: (picked: ReadonlySet<string>) => set({ picked }),
  addModule: (slug: string, initial: readonly string[]) =>
    set({ picked: new Set([...pickedOr(state, initial), slug]) }),
  pickStep: (step: number) => set({ step }),
}
