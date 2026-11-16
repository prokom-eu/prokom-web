'use client'

import { type ComponentType, useEffect, useRef, useState } from 'react'

import { onSearchRequest, requestSearch } from '@/lib/site/searchOpen'
import { isSearchShortcut } from '@/lib/site/searchShortcut'

import type { SwSearchProps } from './SwSearch'

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
 * the window (`SwSearch`: `SearchDialog`, its data, provider and preview) and opens it with the
 * asked phrase. Then the window itself listens, as before.
 */
export function LazySearch(props: SwSearchProps) {
  const [Dialog, setDialog] = useState<ComponentType<SwSearchProps> | null>(null)
  const pending = useRef<{ phrase?: string } | null>(null)

  useEffect(() => {
    if (Dialog) return
    let alive = true
    const load = (phrase?: string) => {
      if (pending.current) return
      pending.current = { phrase }
      import('./SwSearch').then(
        (module) => alive && setDialog(() => module.SwSearch),
        // A failed fetch (network, a new deployment): the next shortcut tries again.
        () => {
          pending.current = null
        },
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
