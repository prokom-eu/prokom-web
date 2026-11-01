'use client'

import { useSyncExternalStore } from 'react'

import { type ChecklistState, INITIAL_CHECKLIST, parseChecklist } from './architektModel'

/*
 * The designer's checklist kept in this browser only (spec §4: „stan tylko w przeglądarce”):
 * read once on the client, written on every change. Storage may be blocked (private mode,
 * settings) — then the list simply starts over, nothing breaks.
 */
const KEY = 'inst-arch-checklist'

let state: ChecklistState | null = null
const listeners = new Set<() => void>()

function load(): ChecklistState {
  if (state) return state
  try {
    state = parseChecklist(window.localStorage.getItem(KEY))
  } catch {
    state = INITIAL_CHECKLIST
  }
  return state
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function setChecklist(next: (s: ChecklistState) => ChecklistState) {
  state = next(load())
  try {
    window.localStorage.setItem(KEY, JSON.stringify(state))
  } catch {
    // Storage blocked: the state lives until the page is left.
  }
  for (const l of listeners) l()
}

export function useChecklist(): ChecklistState {
  return useSyncExternalStore(subscribe, load, () => INITIAL_CHECKLIST)
}
