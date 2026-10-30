'use client'

import { createListStore } from '../list/store'
import { PROJECT_KEY, type Project, parseProject, remove, toggle } from './project'

/** „Twój projekt” in the browser (`pk-project`) on the shared list store (`lib/list/store.ts`). */

const store = createListStore(PROJECT_KEY, parseProject)

export const useProject: () => Project = store.useList
export const onProjectAdded = store.onAdded
export const onProjectOpen = store.onOpen
export const openProjectDrawer = store.open

export const projectActions = {
  /**
   * „+ Dodaj do wyceny” / „✓ W wycenie”. Returns `false` when nothing changed — the list is full
   * (30): the card's button (SW9) must say so, since there is no toast then.
   */
  toggle(id: string, name: string): boolean {
    const before = store.get()
    const result = toggle(before, id, name)
    if (result.project === before) return false
    store.write(result.project)
    if (result.added) store.announce(id, name)
    return true
  },
  remove: (id: string) => store.write(remove(store.get(), id)),
  clear: () => store.write([]),
}
