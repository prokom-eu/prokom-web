'use client'

import { useRef, useState, type ReactNode } from 'react'

import { ProcIcon } from './icons'

/** Lower case without Polish marks: „Gwarancja” and „gwarancję” both find „gwarancj”. */
function normalize(text: string): string {
  return text.toLowerCase().replace(/ł/g, 'l').normalize('NFD').replace(/\p{M}/gu, '')
}

/**
 * Search over the FAQ (ZAOPATRZENIE §2 pkt 17): hides the `<details>` that do not contain the
 * words and opens the ones that do. The questions themselves are server HTML (`children`), so
 * they are all there without JavaScript; the field only filters them.
 */
export function FaqSearch({ empty, children }: { empty: string; children: ReactNode }) {
  const listRef = useRef<HTMLDivElement>(null)
  const [none, setNone] = useState(false)

  const onInput = (value: string) => {
    const query = normalize(value.trim())
    let hits = 0
    for (const item of listRef.current?.querySelectorAll('details') ?? []) {
      const hit = !query || normalize(item.textContent ?? '').includes(query)
      item.hidden = !hit
      if (hit) hits++
      if (query && hit) item.open = true
    }
    setNone(hits === 0)
  }

  return (
    <>
      <label className="zp-fsearch">
        <ProcIcon name="search" />
        <span className="sr-only">Szukaj w pytaniach</span>
        <input
          type="search"
          placeholder="Szukaj w pytaniach, np. gwarancja, etapy, NIP…"
          onChange={(event) => onInput(event.target.value)}
        />
      </label>
      <p className="zp-fempty" role="status">
        {none ? empty : ''}
      </p>
      <div ref={listRef} className="zp-faq">
        {children}
      </div>
    </>
  )
}
