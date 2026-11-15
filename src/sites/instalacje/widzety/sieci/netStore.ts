'use client'

import { useSyncExternalStore } from 'react'

import type { NetMode, VlanKey } from '../../dane/sieci'
import { INITIAL_NET_AUTOPLAY, type NetAutoplay } from './sieciModel'

/*
 * Shared state of the Sieci page: the coverage map in the hero and the „Osobne sieci” section
 * show the same network (the prototype keeps both in one page state). A tiny store instead of a
 * context: the two widgets sit in different parts of the page (hero slot, sections).
 */

export type NetStore = NetAutoplay & { touched: boolean }

let state: NetStore = { ...INITIAL_NET_AUTOPLAY, touched: false }
const listeners = new Set<() => void>()

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function setNet(next: (s: NetStore) => NetStore) {
  state = next(state)
  for (const l of listeners) l()
}

const SERVER: NetStore = { ...INITIAL_NET_AUTOPLAY, touched: false }

/** Back to the start (and the autoplay) when the page is left — the store outlives client navigation. */
export function resetNet() {
  setNet(() => SERVER)
}

export function useNet(): NetStore {
  return useSyncExternalStore(
    subscribe,
    () => state,
    () => SERVER,
  )
}

export type { NetMode, VlanKey }
