'use client'

import { useEffect, useRef, useState } from 'react'

import { priceAt, splitPrice } from '@/lib/software/priceTween'

const TWEEN_MS = 450

/** The last price shown per `memory` key: a remounted price counts on from it. */
const lastShown = new Map<string, string>()

/**
 * The wizard's price that counts to its new value (AUDYT-0811 P2 A10) instead of jumping. Screen
 * readers and reduced motion get the final text at once; a text without an amount just swaps.
 */
export function PriceTween({ text, memory }: { text: string; memory?: string }) {
  const [shown, setShown] = useState(text)
  // `memory`: the offer window mounts its details anew for each offer (OKNO-OFERTY-PREMIUM
  // §2.5) — the price still counts from the previous offer's.
  const last = useRef((memory && lastShown.get(memory)) || text)

  useEffect(() => {
    const from = splitPrice(last.current)
    const to = splitPrice(text)
    last.current = text
    if (memory) lastShown.set(memory, text)
    const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (!from || !to || still || from.value === to.value) {
      const frame = requestAnimationFrame(() => setShown(text))
      return () => cancelAnimationFrame(frame)
    }
    const start = performance.now()
    let frame = 0
    const step = (now: number) => {
      const t = (now - start) / TWEEN_MS
      setShown(priceAt(from.value, to, t))
      if (t < 1) frame = requestAnimationFrame(step)
    }
    frame = requestAnimationFrame(step)
    return () => cancelAnimationFrame(frame)
  }, [text, memory])

  // At rest the plain text (what tests and copying see); only the counting copy is hidden.
  if (shown === text) return text
  return (
    <>
      <span aria-hidden="true" className="tabular-nums">
        {shown}
      </span>
      <span className="sr-only">{text}</span>
    </>
  )
}
