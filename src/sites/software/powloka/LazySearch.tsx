'use client'

import { type ComponentType, useEffect, useRef, useState } from 'react'

import type { SearchDialogProps } from '@/components/shared/SearchDialog'
import { onSearchRequest, requestSearch } from '@/lib/site/searchOpen'
import { isSearchShortcut } from '@/lib/site/searchShortcut'

/** Typing in a field: „/” is a character there, not the shortcut (as in `SearchDialog`). */
function inField(event: KeyboardEvent) {
  const target = event.target as HTMLElement | null
  return Boolean(
    target?.closest?.('input, textarea, select, [contenteditable=""], [contenteditable="true"]'),
  )
}

/**
 * The search window of Software loaded at its first use (AUDYT-WYDAJNOSC-1111 #6): until then
 * only the shortcuts (Ctrl/⌘K, „/”) and `requestSearch()` are heard here; the first of them loads
 * `SearchDialog` and opens it with the asked phrase. Then the window itself listens, as before.
 */
export function LazySearch(props: SearchDialogProps) {
  const [Dialog, setDialog] = useState<ComponentType<SearchDialogProps> | null>(null)
  const pending = useRef<{ phrase?: string } | null>(null)

  useEffect(() => {
    if (Dialog) return
    let alive = true
    const load = (phrase?: string) => {
      if (pending.current) return
      pending.current = { phrase }
      void import('@/components/shared/SearchDialog').then(
        (module) => alive && setDialog(() => module.SearchDialog),
      )
    }
    const onKey = (event: KeyboardEvent) => {
      const { key, ctrlKey, metaKey, altKey } = event
      if (!isSearchShortcut({ key, ctrlKey, metaKey, altKey, typing: inField(event) })) return
      event.preventDefault()
      load()
    }
    document.addEventListener('keydown', onKey)
    const off = onSearchRequest(load)
    return () => {
      alive = false
      document.removeEventListener('keydown', onKey)
      off()
    }
  }, [Dialog])

  // The window's own listeners are set by now (a child's effects run before its parent's): the
  // first request goes to it.
  useEffect(() => {
    if (!Dialog || !pending.current) return
    const { phrase } = pending.current
    pending.current = null
    requestSearch(phrase)
  }, [Dialog])

  return Dialog ? <Dialog {...props} /> : null
}
