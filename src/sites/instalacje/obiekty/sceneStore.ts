'use client'

import { useSyncExternalStore } from 'react'

import { INITIAL_SCENE, type SceneState } from './objectModel'

/*
 * Shared state of an object page: the cross-section in the hero and the „Na przekroju” buttons
 * of the day timeline point at the same hotspot (the prototype keeps both in one page state).
 * A tiny store instead of a context, like the Sieci page: the two sit in different parts of the
 * page (hero slot, sections).
 */

let state: SceneState = INITIAL_SCENE
const listeners = new Set<() => void>()

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function setScene(next: (s: SceneState) => SceneState) {
  state = next(state)
  for (const l of listeners) l()
}

/** Back to the start (and the autoplay) when the page is left — the store outlives client navigation. */
export function resetScene() {
  setScene(() => INITIAL_SCENE)
}

export function useScene(): SceneState {
  return useSyncExternalStore(
    subscribe,
    () => state,
    () => INITIAL_SCENE,
  )
}
