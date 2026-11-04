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
  /** Grows with every click on a step: the stage counts its 2.6 s from zero (POPRAWKI-0311 §A). */
  stepRun: number
}

const INITIAL: GoposState = { venue: null, picked: null, step: null, stepRun: 0 }

/** Steps of the order flow: sala → kuchnia → płatność → kasa. */
const STEPS = 4

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
  pickStep: (step: number) => set({ step, stepRun: state.stepRun + 1 }),
  /** The order moves on by itself (the stage's timer). */
  advance: () => set({ step: ((state.step ?? 0) + 1) % STEPS }),
}
